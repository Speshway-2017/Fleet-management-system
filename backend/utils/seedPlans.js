import SubscriptionPlan from '../models/SubscriptionPlan.js';
import Blog from '../models/Blog.js';
import About from '../models/About.js';

export const seedPlans = async () => {
  try {
    // 1. Seed subscription plans
    const count = await SubscriptionPlan.countDocuments();
    if (count === 0) {
      console.log('🌱 Seeding initial subscription plans...');
      const plans = [
        {
          name: 'Basic',
          description: 'Essential fleet management tools for small businesses.',
          price: 999,
          duration: 30,
          status: 'Active',
          displayOrder: 1,
          maxVehicles: 5,
          maxDrivers: 5,
          maxTrips: 100,
          features: [
            'Real-time vehicle tracking',
            'Up to 5 active vehicles',
            'Standard trip log history',
            'Basic email support'
          ]
        },
        {
          name: 'Professional',
          description: 'Advanced capabilities for growing medium-sized fleets.',
          price: 2499,
          duration: 30,
          status: 'Active',
          displayOrder: 2,
          maxVehicles: 25,
          maxDrivers: 25,
          maxTrips: 1000,
          features: [
            'Real-time vehicle tracking',
            'Up to 25 active vehicles',
            'Detailed analytics & history',
            'Fuel & maintenance logs',
            'Email & chat priority support'
          ]
        },
        {
          name: 'Enterprise',
          description: 'Full-suite automation, unlimited scaling, and premium support.',
          price: 4999,
          duration: 90,
          status: 'Active',
          displayOrder: 3,
          maxVehicles: 9999,
          maxDrivers: 9999,
          maxTrips: 99999,
          features: [
            'Unlimited vehicles & drivers',
            'Advanced scheduled reports',
            'Full integration API access',
            'E-way bill auto-generation',
            '24/7 dedicated support'
          ]
        }
      ];
      await SubscriptionPlan.insertMany(plans);
      console.log('✅ Subscription plans seeded successfully!');
    }

    // 2. Seed blogs
    const blogCount = await Blog.countDocuments();
    if (blogCount === 0) {
      console.log('🌱 Seeding initial blogs...');
      const blogs = [
        {
          category: "Operations",
          title: "How Digital Fleet Platforms Improve Business Efficiency",
          summary: "Discover how centralized fleet management platforms simplify daily operations, improve collaboration, enhance visibility, and support better decision-making for growing transportation businesses.",
          image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80",
          date: "July 14, 2026",
          readTime: "5 min read",
          content: [
            "In today's fast-paced logistics landscape, digital fleet management platforms have transitioned from being a convenience to a necessity. These comprehensive software suites consolidate vehicle locations, route updates, scheduling, driver statuses, and telemetry data into a single, intuitive dashboard. This unified view empowers dispatchers to coordinate trips seamlessly and minimize miscommunications.",
            "One of the most immediate benefits is real-time visibility. By knowing the precise location of every truck or van in the roster, businesses can respond to client inquiries instantly, optimize fuel consumption, and reroute vehicles dynamically to avoid heavy traffic or hazardous weather conditions. This operational agility directly translates to lower fuel overheads and improved customer satisfaction.",
            "Furthermore, automation reduces the heavy burden of manual bookkeeping. Digital platforms handle compliance documentation, driver rosters, licensing renewals, and safety logs. This mitigates compliance errors and simplifies the auditing process, allowing management teams to focus on scaling operations rather than managing endless paperwork.",
            "Ultimately, the consolidation of data offers invaluable analytical insights. Business owners can inspect detailed reports on idle times, average speeds, fuel usage, and route efficiency. These data-driven inputs enable logistics directors to identify bottlenecks and configure strategic reforms that drive long-term business productivity."
          ]
        },
        {
          category: "Security",
          title: "Building Secure Fleet Operations for Modern Businesses",
          summary: "Learn how secure authentication, role-based access, data protection, and cloud infrastructure help organizations safeguard operational information.",
          image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
          date: "July 12, 2026",
          readTime: "4 min read",
          content: [
            "Security is a paramount concern for enterprise fleet management, as logistics networks deal with sensitive customer addresses, freight schedules, and driver identification records. A breach in operational databases could compromise business logistics, disrupt operations, and lead to financial liabilities.",
            "Implementing role-based access control (RBAC) is the first line of defense. By assigning granular authorization rules, companies ensure that dispatchers, vehicle managers, and drivers only have access to information relevant to their roles. An admin dashboard handles critical operations configurations, while a driver dashboard is streamlined for route execution, keeping systemic vulnerabilities to a minimum.",
            "Data encryption forms the core of information protection. Operational telemetry transmitted from vehicle trackers to cloud systems must be secured using robust cryptographic standards, such as TLS 1.3 in transit and AES-256 at rest. This protects vital diagnostics logs, GPS streams, and database records from potential interceptors.",
            "Regular auditing and system health checks complete the security cycle. Maintaining comprehensive logs of user actions, login times, and database edits helps detect suspicious behavior early, safeguarding fleet assets against digital and physical threats."
          ]
        },
        {
          category: "Technology",
          title: "Cloud-Based Fleet Management for Enterprise Growth",
          summary: "Explore how cloud technology enables organizations to manage drivers, vehicles, documents, and operational data from anywhere with greater efficiency.",
          image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
          date: "July 10, 2026",
          readTime: "6 min read",
          content: [
            "Scaling a logistics organization requires infrastructure that expands alongside vehicle count and user demands. Cloud-based fleet management solutions offer the perfect foundation for this transition, removing the constraints of localized legacy servers.",
            "Cloud platforms ensure that operational dashboards are accessible from anywhere. Whether dispatch managers are at headquarters or working remotely, they can manage driver assignments, monitor vehicle statuses, and coordinate service requests in real-time, fostering unified team collaboration.",
            "Cost efficiency is another major factor. Cloud hosting eliminates the need for expensive hardware maintenance and localized IT staff. Platforms scale system resources dynamically, handling peak hours with ease without performance degradation.",
            "Finally, cloud integration facilitates automated feature upgrades, continuous telemetry syncing, and remote data backups. This reliability ensures that operational histories remain secure and accessible even during unforeseen localized hardware failures."
          ]
        },
        {
          title: "Improving Fleet Visibility Across Multiple Locations",
          category: "Operations",
          date: "July 8, 2026",
          readTime: "4 min read",
          summary: "Learn how modern centralized management systems enable complete tracking and visibility of enterprise transport assets and drivers across global hubs.",
          image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80",
          content: [
            "For businesses operating across multiple regional hubs, coordinating fleet movement is highly challenging. Integrating telemetry systems under a single cloud platform is the key to maintaining consistent, cross-hub operational visibility.",
            "Live location streams and regional geofences allow operators to track transit progress as vehicles travel between hubs. Automated notices notify dispatchers when a truck leaves one territory and enters another, improving ETA accuracy.",
            "This level of control allows companies to reallocate vehicles to where driver demand is highest, reducing empty returns and maximizing fleet utility."
          ]
        },
        {
          title: "Enterprise Security Best Practices",
          category: "Security",
          date: "July 5, 2026",
          readTime: "5 min read",
          summary: "Implement advanced role-based access controls, robust data protection, and cloud infrastructure to safeguard sensitive operational data.",
          image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80",
          content: [
            "Securing logistics data involves continuous adherence to rigorous standards. Best practices include mandatory multi-factor authentication (MFA) for administrative accounts, regular password rotations, and routine penetration tests.",
            "Training staff to recognize social engineering tactics and phishing emails is equally important. Secure configurations must cover driver communication channels, safeguarding mobile dispatch platforms from unauthorized overrides."
          ]
        },
        {
          title: "Benefits of Digital Documentation",
          category: "Compliance",
          date: "July 2, 2026",
          readTime: "3 min read",
          summary: "Transition to electronic record-keeping to simplify compliance audits, improve record accuracy, and streamline driver management processes.",
          image: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80",
          content: [
            "Replacing paper sheets with digital records simplifies driver compliance and regulatory reporting. Electronic logs instantly record driver hours, maintenance logs, and vehicle inspections, removing manual calculation errors.",
            "During audits, digital databases allow managers to fetch specific records in seconds, avoiding operational delays and showing a strong commitment to compliance."
          ]
        }
      ];
      await Blog.insertMany(blogs);
      console.log('✅ Blogs seeded successfully!');
    }

    // 3. Seed About
    const aboutCount = await About.countDocuments();
    if (aboutCount === 0) {
      console.log('🌱 Seeding initial about content...');
      const about = new About({
        storyTitle: "Built for Fleet Operators, by Logistics Experts",
        storyContent: [
          "Founded in 2021, FleetManagement began with a simple observation: most fleet management tools were either too complicated for daily operations or too basic for enterprise needs.",
          "Our team of logistics veterans and enterprise engineers came together to build a platform that bridges the gap — powerful analytics wrapped in an intuitive, driver-friendly interface."
        ],
        missionTitle: "Eliminating Blind Spots in Fleet Operations",
        missionContent: [
          "Every year, inefficient fleet management costs businesses billions in wasted resources, unexpected breakdowns, and compliance failures. Most operators don't know what they don't know.",
          "FleetManagement gives operations teams complete, real-time intelligence across every asset in their fleet — so decisions are driven by data, not guesswork."
        ],
        missionQuote: "The only way to run a fleet well is to see it clearly.",
        statsFounded: "2018",
        statsEnterprises: "340+",
        statsVehicles: "1.2M+",
        statsSavings: "$180M+",
        timeline: [
          { year: "2018", text: "FleetManagement founded in Bengaluru, India. Seed funding of ₹30 Cr." },
          { year: "2019", text: "First 50 enterprise customers. Launched real-time GPS tracking." },
          { year: "2021", text: "Series A — ₹200 Cr. Expanded to reporting & analytics and driver management." },
          { year: "2023", text: "Surpassed 1M vehicles tracked. Launched performance monitoring cloud platform." },
          { year: "2026", text: "340+ enterprise clients. ₹1,500 Cr+ in documented customer savings." }
        ]
      });
      await about.save();
      console.log('✅ About info seeded successfully!');
    }
  } catch (error) {
    console.error('❌ Failed to seed subscription plans and pages:', error);
  }
};
