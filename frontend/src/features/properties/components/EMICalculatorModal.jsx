import React, { useState } from 'react';
import { Calculator, X, DollarSign, Calendar, Percent } from 'lucide-react';
import { Button } from '../../../shared/components/ui/button';
import { Card, CardContent } from '../../../shared/components/ui/card';

export function EMICalculatorModal({ isOpen, onClose, defaultPrice = 8500000 }) {
  const [loanAmount, setLoanAmount] = useState(defaultPrice * 0.8);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenureYears, setTenureYears] = useState(20);

  if (!isOpen) return null;

  // Calculate monthly EMI
  const calculateEMI = () => {
    const p = loanAmount;
    const r = interestRate / 12 / 100;
    const n = tenureYears * 12;
    if (r === 0) return p / n;
    const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return Math.round(emi);
  };

  const monthlyEMI = calculateEMI();
  const totalPayment = monthlyEMI * tenureYears * 12;
  const totalInterest = totalPayment - loanAmount;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-card border rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Home Loan EMI Calculator</h3>
              <p className="text-xs text-muted-foreground">Calculate monthly installments & interest schedule</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Loan Inputs */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Loan Amount</span>
                <span className="text-primary font-bold">₹{(loanAmount / 100000).toFixed(2)} Lakhs</span>
              </div>
              <input
                type="range"
                min="1000000"
                max="50000000"
                step="500000"
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Interest Rate (% p.a.)</span>
                <span className="text-primary font-bold">{interestRate}%</span>
              </div>
              <input
                type="range"
                min="6.5"
                max="12.0"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Loan Tenure (Years)</span>
                <span className="text-primary font-bold">{tenureYears} Years</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                step="1"
                value={tenureYears}
                onChange={(e) => setTenureYears(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
          </div>

          {/* Results Summary Box */}
          <Card className="bg-muted/40 border">
            <CardContent className="p-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <span className="text-[11px] text-muted-foreground block">Monthly EMI</span>
                <span className="text-lg font-extrabold text-primary">₹{monthlyEMI.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground block">Total Interest</span>
                <span className="text-sm font-bold text-amber-600">₹{Math.round(totalInterest / 100000).toFixed(2)} L</span>
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground block">Total Payable</span>
                <span className="text-sm font-bold">₹{Math.round(totalPayment / 100000).toFixed(2)} L</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t bg-muted/20 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
