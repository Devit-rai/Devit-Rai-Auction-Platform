export const getAuctionStatus = (startTime, endTime) => {
  const now = new Date();

  if (now < new Date(startTime)) {
    return "Upcoming";
  }

  if (now >= new Date(startTime) && now <= new Date(endTime)) {
    return "Live";
  }

  return "Ended";
};
