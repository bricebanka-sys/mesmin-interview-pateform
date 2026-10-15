import { QuickActionType } from "@/constants";
import { Card } from "./ui/card";




// bg-gradient-to-br from-orange-500/20 via-orange-500/5 to-transparent
// bg-gradient-to-br from-blue-500/20 via-blue-500/5 to-transparent

// bg-gradient-to-br from-purple-500/20 via-purple-500/5 to-transparent
// from-emerald-500/20 via-emerald-500/5 to-transparent


function ActionCard({ action, onClick }: { action: QuickActionType; onClick: () => void }) {
  return (
    <Card
      className="group relative overflow-hidden hover:border-primary/50 transition-all duration-300
      hover:shadow-lg cursor-pointer"
      onClick={onClick}
    >
      {/* ACTION GRADIENT */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-100 group-hover:opacity-50
        transition-opacity`}
      />
      {/* ACTION CONTENT WRAPPER */}

      <div className="relative p-6 size-full">
        <div className="space-y-3">
          {/* ACTION ICON */}
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center bg-${action.color}/10
            group-hover:scale-110 transition-transform`}
          >
            <action.icon className={`h-6 w-6 text-${action.color} group-hover:text-[#2664EC] transition-colors`} />
          </div>
          {/* ACTION DETAILS */}

          <div className="space-y-1">
            <h3 className="font-semibold text-xl group-hover:text-[#2664EC] transition-colors">
              {action.title}
            </h3>
            <p className="text-sm text-muted-foreground group-hover:text-[#2664EC] transition-colors">{action.description}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default ActionCard