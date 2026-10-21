import ContactRequest from '../models/ContactRequest.js';
import { sendSuccess, sendError } from '../utils/response.js';
import sendEmail from '../utils/email.js';

// List all contact requests with pagination, search, and filters
export const listContactRequests = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { search, status, subject, startDate, endDate } = req.query;

    const query = {};

    // Search query (fullName, email, subject, ticketId)
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { ticketId: { $regex: search, $options: 'i' } }
      ];
    }

    // Status filter
    if (status && status !== 'All') {
      query.status = status;
    }

    // Subject filter
    if (subject && subject !== 'All') {
      query.subject = subject;
    }

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        // Set end date to end of the day
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const total = await ContactRequest.countDocuments(query);
    const contacts = await ContactRequest.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return sendSuccess(res, 200, {
      contacts,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        total
      }
    }, 'Contact requests retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// Fetch analytics for contact requests
export const getContactAnalytics = async (req, res, next) => {
  try {
    // 1. Calculate time window boundaries
    const now = new Date();
    
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 2. Query counts
    const todayCount = await ContactRequest.countDocuments({
      createdAt: { $gte: startOfToday }
    });

    const thisWeekCount = await ContactRequest.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    const thisMonthCount = await ContactRequest.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    const totalRequests = await ContactRequest.countDocuments();
    const newRequests = await ContactRequest.countDocuments({ status: 'New' });
    const pendingRequests = await ContactRequest.countDocuments({ status: 'Pending' });
    const resolvedRequests = await ContactRequest.countDocuments({ status: 'Resolved' });

    // 3. Average response time for resolved requests (in hours)
    let averageResponseTime = '0.0';
    const resolvedItems = await ContactRequest.find({
      status: 'Resolved',
      resolvedAt: { $exists: true }
    });

    if (resolvedItems.length > 0) {
      const totalDiffMs = resolvedItems.reduce((acc, curr) => {
        const diff = new Date(curr.resolvedAt) - new Date(curr.createdAt);
        return acc + (diff > 0 ? diff : 0);
      }, 0);
      const avgMs = totalDiffMs / resolvedItems.length;
      averageResponseTime = (avgMs / (1000 * 60 * 60)).toFixed(1); // Hours with 1 decimal
    }

    // 4. Most selected subject
    const subjectStats = await ContactRequest.aggregate([
      { $group: { _id: '$subject', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    const mostSelectedSubject = subjectStats.length > 0 ? subjectStats[0]._id : 'N/A';

    return sendSuccess(res, 200, {
      summary: {
        total: totalRequests,
        new: newRequests,
        pending: pendingRequests,
        resolved: resolvedRequests
      },
      timeframes: {
        today: todayCount,
        thisWeek: thisWeekCount,
        thisMonth: thisMonthCount
      },
      averageResponseTime,
      mostSelectedSubject
    }, 'Contact analytics loaded successfully');
  } catch (error) {
    next(error);
  }
};

// Update contact request status & notes
export const updateContactRequestStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, responseNotes } = req.body;

    if (!['New', 'Pending', 'Resolved'].includes(status)) {
      return sendError(res, 400, 'Invalid status update');
    }

    const contact = await ContactRequest.findById(id);
    if (!contact) {
      return sendError(res, 404, 'Contact request not found');
    }

    contact.status = status;
    if (responseNotes !== undefined) {
      contact.responseNotes = responseNotes;
    }

    if (status === 'Resolved') {
      contact.resolvedAt = new Date();
    } else {
      contact.resolvedAt = undefined;
    }

    await contact.save();
    return sendSuccess(res, 200, contact, `Request status updated to ${status}`);
  } catch (error) {
    next(error);
  }
};

// Reply to contact request via email and update history
export const replyToContactRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { message, updateStatusTo } = req.body; // e.g. status goes to Resolved or Pending

    if (!message || message.trim() === '') {
      return sendError(res, 400, 'Reply message cannot be empty');
    }

    const contact = await ContactRequest.findById(id);
    if (!contact) {
      return sendError(res, 404, 'Contact request not found');
    }

    // Send email response via Nodemailer
    await sendEmail({
      email: contact.email,
      subject: `Re: [Ticket ${contact.ticketId}] Support Inquiry: ${contact.subject}`,
      message: `Hello ${contact.fullName},\n\nThank you for reaching out to us.\n\nHere is our response to your inquiry regarding "${contact.subject}":\n\n${message}\n\nBest regards,\n\nFleet Management Support Team`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="background-color: #0B1B3D; color: white; padding: 20px; font-weight: bold; font-size: 18px;">
            Fleet Management Support Response
          </div>
          <div style="padding: 20px;">
            <p>Hello <strong>${contact.fullName}</strong>,</p>
            <p>Thank you for reaching out to us. Below is our response to your contact request <strong>(${contact.ticketId})</strong> regarding "<strong>${contact.subject}</strong>":</p>
            
            <div style="background-color: #f8fafc; border-left: 4px solid #0B1B3D; padding: 15px; border-radius: 4px; margin: 20px 0; font-size: 14px; color: #1e293b;">
              ${message.replace(/\n/g, '<br/>')}
            </div>

            <p style="font-size: 13px; color: #64748b;">
              <em>Original Message submitted on ${new Date(contact.createdAt).toLocaleDateString()}:</em><br/>
              "${contact.message}"
            </p>
            
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="margin-bottom: 0;">Best regards,</p>
            <p style="margin-top: 0; font-weight: bold; color: #0B1B3D;">Fleet Management Support Team</p>
          </div>
          <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #64748b;">
            Fleet Management System &copy; 2026
          </div>
        </div>
      `
    });

    // Record response in history
    const replierName = req.user?.name || 'Super Admin';
    contact.history.push({
      replier: replierName,
      message,
      sentAt: new Date()
    });

    // Update status if selected
    if (updateStatusTo && ['Pending', 'Resolved'].includes(updateStatusTo)) {
      contact.status = updateStatusTo;
      if (updateStatusTo === 'Resolved') {
        contact.resolvedAt = new Date();
      }
    } else {
      // Default to Resolved after reply
      contact.status = 'Resolved';
      contact.resolvedAt = new Date();
    }

    await contact.save();
    return sendSuccess(res, 200, contact, 'Reply email sent and ticket updated');
  } catch (error) {
    next(error);
  }
};

// Delete a contact request
export const deleteContactRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const contact = await ContactRequest.findByIdAndDelete(id);
    if (!contact) {
      return sendError(res, 404, 'Contact request not found');
    }
    return sendSuccess(res, 200, null, 'Contact request deleted successfully');
  } catch (error) {
    next(error);
  }
};

// Export all contact requests to CSV
export const exportContactsCSV = async (req, res, next) => {
  try {
    const contacts = await ContactRequest.find().sort({ createdAt: -1 });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=contact_requests.csv');

    let csv = 'Ticket ID,Full Name,Email,Company,Phone,Subject,Status,Created At,Resolved At,Message,Response Notes\n';
    
    for (const c of contacts) {
      const ticketId = c.ticketId || '';
      const name = `"${c.fullName.replace(/"/g, '""')}"`;
      const email = `"${c.email.replace(/"/g, '""')}"`;
      const company = `"${(c.company || '').replace(/"/g, '""')}"`;
      const phone = `"${(c.phone || '').replace(/"/g, '""')}"`;
      const subject = `"${c.subject.replace(/"/g, '""')}"`;
      const status = c.status || 'New';
      const createdAt = c.createdAt ? c.createdAt.toISOString() : '';
      const resolvedAt = c.resolvedAt ? c.resolvedAt.toISOString() : '';
      const message = `"${c.message.replace(/"/g, '""').replace(/\n/g, ' ')}"`;
      const responseNotes = `"${(c.responseNotes || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`;
      
      csv += `${ticketId},${name},${email},${company},${phone},${subject},${status},${createdAt},${resolvedAt},${message},${responseNotes}\n`;
    }

    return res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};
