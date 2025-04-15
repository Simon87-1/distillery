const approximateDateDiff = (startDate, endDate) => {
  let years = endDate.getFullYear() - startDate.getFullYear();
  let months = endDate.getMonth() - startDate.getMonth();
  let days = endDate.getDate() - startDate.getDate();

  if (days < 0) {
    months--;
    const previousMonth = new Date(
      endDate.getFullYear(),
      endDate.getMonth(),
      0,
    );
    days += previousMonth.getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  const formatDuration = () => {
    const parts = [
      years > 0 && `${years} yr `,
      months > 0 && `${months} mo `,
      days > 0 && (days === 1 ? "1 day" : `${days} days`),
    ].filter(Boolean);

    return parts.join(" ") || "Today";
  };

  return formatDuration();
};

export const getDateDifferenceFromToday = (pastDays) => {
  const today = new Date();
  const pastDate = new Date(today);
  pastDate.setDate(today.getDate() - pastDays);
  return approximateDateDiff(pastDate, new Date());
};

export const factsHeaders = [
  "Medications",
  "Problems",
  "Procedures",
  "Diagnostic Results",
  "Allergies & Intolerances",
  "Immunisations",
  "Family History",
  "Social History",
];
