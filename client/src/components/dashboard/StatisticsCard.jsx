const StatisticsCard = ({ title, value, color, icon: Icon }) => (
  <div className="bg-slate-800 p-4 rounded-lg shadow-md flex items-center gap-3">
    {Icon && <Icon className={`text-3xl ${color}`} />}
    <div>
      <h3 className="text-sm font-medium text-slate-400">{title}</h3>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  </div>
);

export default StatisticsCard;