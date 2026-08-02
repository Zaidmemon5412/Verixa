import { Check, X } from 'lucide-react';

/**
 * PasswordStrength component.
 * Evaluates password against security rules and displays a strength meter and requirement checklist.
 */
export const PasswordStrength = ({ password = '' }) => {
  const rules = [
    { label: 'At least 8 characters', valid: password.length >= 8 },
    { label: 'One uppercase letter (A-Z)', valid: /[A-Z]/.test(password) },
    { label: 'One lowercase letter (a-z)', valid: /[a-z]/.test(password) },
    { label: 'One number (0-9)', valid: /\d/.test(password) },
    { label: 'One special character (!@#$%^&*)', valid: /[^a-zA-Z0-9]/.test(password) },
  ];

  const validCount = rules.filter((r) => r.valid).length;
  const percentage = (validCount / rules.length) * 100;

  const getStrengthMeta = () => {
    if (password.length === 0) return { label: '', color: 'bg-slate-800', textColor: 'text-slate-500' };
    if (validCount <= 2) return { label: 'Weak', color: 'bg-red-500', textColor: 'text-red-400' };
    if (validCount <= 4) return { label: 'Fair', color: 'bg-amber-500', textColor: 'text-amber-400' };
    return { label: 'Strong', color: 'bg-emerald-500', textColor: 'text-emerald-400' };
  };

  const meta = getStrengthMeta();

  return (
    <div className="mt-3 space-y-2 select-none" id="password-strength-indicator">
      {/* Strength Bar & Label */}
      {password.length > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-slate-400">Password Strength</span>
            <span className={meta.textColor}>{meta.label}</span>
          </div>
          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-300 ${meta.color}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Rules Checklist */}
      <div className="grid grid-cols-1 gap-1.5 pt-1">
        {rules.map((rule, index) => (
          <div key={index} className="flex items-center space-x-2 text-xs">
            {rule.valid ? (
              <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            ) : (
              <X className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
            )}
            <span className={rule.valid ? 'text-slate-300 font-medium' : 'text-slate-500'}>
              {rule.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordStrength;
