export const formatIFD = (dateString) => {
  if (!dateString) return "-";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "-";
  
  const day = d.getDate().toString().padStart(2, '0');
  const month = d.toLocaleString('en-IN', { month: 'short' });
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

export const formatIFDWithTime = (dateString) => {
  if (!dateString) return "-";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "-";
  
  const day = d.getDate().toString().padStart(2, '0');
  const month = d.toLocaleString('en-IN', { month: 'short' });
  const year = d.getFullYear();
  const time = d.toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  return `${day}-${month}-${year}, ${time}`;
};

export const getDaysRemaining = (expiryDate, status = "ACTIVE") => {
  if (status !== "ACTIVE" || !expiryDate) return "--";
  const expiry = new Date(expiryDate);
  if (isNaN(expiry.getTime())) return "--";
  const now = new Date();
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};
