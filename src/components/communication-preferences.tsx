import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface CommunicationPreferencesProps {
  preferences: {
    notifications: boolean;
    newsletter: boolean;
    earlyAccess: boolean;
  };
  onPreferenceChange: (key: string, value: boolean) => void;
}

const preferencesList = [
  {
    key: "notifications",
    label: "Receber notificações sobre atualizações",
  },
  {
    key: "newsletter",
    label: "Subscrever newsletter com dicas e novidades",
  },
  {
    key: "earlyAccess",
    label: "Acesso antecipado a novas funcionalidades",
  },
];

export function CommunicationPreferences({
  preferences,
  onPreferenceChange,
}: CommunicationPreferencesProps) {
  return (
    <div className="space-y-4 rounded-2xl bg-white/5 p-6">
      <h3 className="text-lg font-bold text-white">
        Preferências de Comunicação
      </h3>
      <div className="space-y-3">
        {preferencesList.map(pref => (
          <div key={pref.key} className="flex items-center space-x-3">
            <Checkbox
              id={pref.key}
              checked={preferences[pref.key as keyof typeof preferences]}
              onCheckedChange={checked =>
                onPreferenceChange(pref.key, checked as boolean)
              }
              className="border-white/40"
            />
            <Label htmlFor={pref.key} className="text-sm text-white/90">
              {pref.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}
