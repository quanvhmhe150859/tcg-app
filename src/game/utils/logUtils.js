export const getLogColor = (type) => {
  switch (type) {
    case "heal":
      return "text-green-400";
    case "crit":
      return "text-orange-300";
    case "defeat":
    case "system":
      return "text-red-400";
    case "gold":
      return "text-yellow-300";
    case "ticket":
      return "text-pink-300";
    default:
      return "text-gray-300";
  }
};
