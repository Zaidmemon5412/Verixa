import React, { useState, useEffect } from 'react';
import { Calculator, Percent, Calendar, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/components/ui/card';

export function EMICalculatorCard({ defaultPrice = 8500000 }) {
  const initialPrice = defaultPrice > 0 ? defaultPrice : 8500000;
  
  const [propertyPrice, setPropertyPrice] = useState(initialPrice);
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenureYears, setTenureYears] = useState(20);

  useEffect(() => {
    if (defaultPrice > 0) {
      setPropertyPrice(defaultPrice);
    }
  }, [defaultPrice]);

  const downPaymentAmount = Math.round((propertyPrice * downPaymentPct) / 100);
  const loanAmount = Math.max(0, propertyPrice - downPaymentAmount);

  // Real-time Monthly EMI Calculation
  const calculateEMI = () => {
    if (loanAmount <= 0) return 0;
    const p = loanAmount;
    const r = interestRate / 12 / 100;
    const n = tenureYears * 12;
    if (r === 0) return p / n;
    const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return Math.round(emi);
  };

  const monthlyEMI = calculateEMI();
  const totalPayment = monthlyEMI * tenureYears * 12;
  const totalInterest = Math.max(0, totalPayment - loanAmount);

  const formatLakhs = (val) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <Card className="rounded-2xl border-2 border-border/80 bg-card shadow-sm overflow-hidden text-foreground">
      <CardHeader className="p-4 bg-muted/40 border-b">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <Calculator className="w-4 h-4" />
          </div>
          <span>Home Loan EMI Calculator</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 space-y-4 text-xs">
        {/* Real-time Inputs */}
        <div className="space-y-3">
          {/* Property Price */}
          <div>
            <div className="flex justify-between font-semibold mb-1">
              <span className="text-muted-foreground">Property Price</span>
              <span className="font-bold text-foreground">{formatLakhs(propertyPrice)}</span>
            </div>
            <input
              type="range"
              min="2000000"
              max="50000000"
              step="500000"
              value={propertyPrice}
              onChange={(e) => setPropertyPrice(Number(e.target.value))}
              className="w-full accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
            />
          </div>

          {/* Down Payment */}
          <div>
            <div className="flex justify-between font-semibold mb-1">
              <span className="text-muted-foreground">Down Payment ({downPaymentPct}%)</span>
              <span className="font-bold text-foreground">{formatLakhs(downPaymentAmount)}</span>
            </div>
            <input
              type="range"
              min="10"
              max="80"
              step="5"
              value={downPaymentPct}
              onChange={(e) => setDownPaymentPct(Number(e.target.value))}
              className="w-full accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
            />
          </div>

          {/* Auto-Calculated Loan Amount */}
          <div className="p-2.5 bg-muted/50 rounded-xl border flex justify-between items-center font-medium">
            <span className="text-muted-foreground">Auto Loan Amount:</span>
            <span className="font-bold text-primary">{formatLakhs(loanAmount)}</span>
          </div>

          {/* Interest Rate */}
          <div>
            <div className="flex justify-between font-semibold mb-1">
              <span className="text-muted-foreground">Interest Rate (% p.a.)</span>
              <span className="font-bold text-foreground">{interestRate}%</span>
            </div>
            <input
              type="range"
              min="6.5"
              max="13.0"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
            />
          </div>

          {/* Loan Tenure */}
          <div>
            <div className="flex justify-between font-semibold mb-1">
              <span className="text-muted-foreground">Loan Tenure</span>
              <span className="font-bold text-foreground">{tenureYears} Years</span>
            </div>
            <input
              type="range"
              min="5"
              max="30"
              step="1"
              value={tenureYears}
              onChange={(e) => setTenureYears(Number(e.target.value))}
              className="w-full accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* EMI Results Summary */}
        <div className="bg-primary/5 border border-primary/20 p-3 rounded-xl space-y-2 text-center">
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Monthly EMI</span>
            <span className="text-xl font-black text-primary">₹{monthlyEMI.toLocaleString('en-IN')}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-primary/10 text-[11px]">
            <div>
              <span className="text-muted-foreground block">Total Interest</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">{formatLakhs(totalInterest)}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Total Payable</span>
              <span className="font-bold text-foreground">{formatLakhs(totalPayment)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default EMICalculatorCard;
