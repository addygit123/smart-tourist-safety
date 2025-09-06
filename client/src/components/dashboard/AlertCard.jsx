const AlertCard = ({ type, message, timestamp }) => {
  const colors = {
    sos: "bg-red-600",
    anomaly: "bg-orange-500",
    info: "bg-blue-500",
  };

  return (
    <div className={`p-4 rounded-lg shadow-md text-white ${colors[type] || "bg-slate-700"}`}>
      <h4 className="font-bold capitalize">{type} Alert</h4>
      <p className="text-sm">{message}</p>
      <span className="text-xs opacity-80">{timestamp}</span>
    </div>
  );
};
export default AlertCard;
