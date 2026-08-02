import { Check, X } from 'lucide-react';

/**
 * PasswordStrength component.
 * Evaluates password rules and displays animated progress bar & rule checklist.
 */
export const PasswordStrength = ({ password = '' }) => {
  if (!password) return null;

  const rules = [
    { label: 'At least 8 characters', valid: password.length >= 8 },
    { label: 'At least one uppercase letter (A-Z)', valid: /[A-Z]/.test(password) },
    { label: 'At least one lowercase letter (a-z)', valid: /[a-z]/.test(password) },
    { label: 'At least one number (0-9)', valid: /\d/.test(password) },
    { label: 'At least one special character (!@#$%^&*)', valid: /[^a-zA-Z0-9]/.test(password) },
  ];

  const passedCount = rules.filter((r) => r.valid).length;
  const percentage = (passedCount / rules.length) * 100;

  const getBarColor = () => {
    if (passedCount <= 2) return 'bg-red-500';
    if (passedCount <= 4) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const getStrengthLabel = () => {
    if (passedCount <= 2) return { text: 'Weak', color: 'text-red-400' };
    if (passedCount <= 4) return { text: 'Medium', color: 'text-amber-400' };
    return { text: 'Strong', color: 'text-emerald-400' };
  };

  const strength = getStrengthLabel();

  return (
    <div className="mt-3 space-y-2.5 p-3 rounded-lg bg-slate-950/40 border border-white/5 select-none" id="password-strength-meter">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400 font-medium">Password Strength:</span>
        <span className={`font-bold ${strength.color}`}>{strength.text}</span>
      </div>

      {/* Progress Bar Container */}
      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${getBarColor()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Checklist Rules */}
      <div className="grid grid-cols-1 gap-1.5 pt-1">
        {rules.map((rule, idx) => (
          <div key={idx} className="flex items-center space-x-2 text-[11px]">
            {rule.valid ? (
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            ) : (
              <X className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            )}
            <span className={rule.valid ? 'text-slate-200 font-medium' : 'text-slate-500'}>
              {rule.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordStrength;
