import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  X, Calendar, Clock, User, Phone, Mail, MessageSquare, 
  Building2, CheckCircle2, AlertCircle, Sparkles, Send
} from 'lucide-react';
import useAuth from '../../auth/hooks/useAuth';
import useEnquiryMutation from '../../inquiries/hooks/useEnquiryMutation';
import { ButtonLoader } from '../../../shared/components/Loader';
import { Button } from '../../../shared/components/ui/button';

export function BuilderInquiryModal({ isOpen, onClose, builder, initialType = 'general', firstProjectId }) {
  const { user } = useAuth();
  const { mutateAsync, loading, error } = useEnquiryMutation();

  const [type, setType] = useState(initialType); // 'general' or 'site_visit'
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('10:00 AM');
  const [message, setMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  // Sync initial type prop
  useEffect(() => {
    if (initialType) setType(initialType);
  }, [initialType]);

  // Pre-fill user data if logged in
  useEffect(() => {
    if (user) {
      setFullName(user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email?.split('@')[0] || '');
      setEmail(user.email || '');
      setPhone(user.phone_number || user.phone || '');
    }
  }, [user]);

  // Default preferred date to tomorrow
  useEffect(() => {
    if (isOpen) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setPreferredDate(tomorrow.toISOString().split('T')[0]);
    }
  }, [isOpen]);

  if (!isOpen || !builder) return null;

  const validate = () => {
    const errs = {};
    if (!fullName.trim()) errs.fullName = 'Full Name is required.';
    if (!phone.trim()) {
      errs.phone = 'Phone Number is required.';
    } else if (!/^[0-9+\-\s]{8,15}$/.test(phone.trim())) {
      errs.phone = 'Please enter a valid phone number.';
    }
    if (!email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }
    if (type === 'site_visit' && !preferredDate) {
      errs.preferredDate = 'Please select a preferred date.';
    }

    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const formattedMessage = [
        `[BUILDER DIRECT INQUIRY]`,
        `Developer Name: ${builder.name || builder.builder_name}`,
        `Developer ID: ${builder.id || builder.builder_id}`,
        `Inquiry Type: ${type === 'site_visit' ? 'Schedule Site Visit' : 'General Developer Inquiry'}`,
        `Contact Name: ${fullName.trim()}`,
        `Phone Number: ${phone.trim()}`,
        `Email: ${email.trim()}`,
        type === 'site_visit' && preferredDate ? `Preferred Date: ${preferredDate}` : null,
        type === 'site_visit' && preferredTime ? `Preferred Slot: ${preferredTime}` : null,
        message.trim() ? `Message: ${message.trim()}` : null
      ].filter(Boolean).join('\n');

      await mutateAsync({
        propertyId: firstProjectId || builder.firstProjectId || '2454ac50-9c8d-5b84-a24e-4f9d51f67d60',
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        type,
        preferredDate,
        preferredTime,
        message: formattedMessage
      });

      toast.success(
        type === 'site_visit'
          ? `Site visit requested with ${builder.name}! Their team will contact you.`
          : `Inquiry submitted successfully to ${builder.name}!`
      );
      onClose();
    } catch (err) {
      const errMsg = err.message || 'Submission failed. Please try again.';
      toast.error(errMsg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="relative p-6 pb-4 border-b bg-muted/40">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-xs font-bold text-primary mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>DEVELOPER INQUIRY SYSTEM</span>
          </div>

          <h3 className="text-xl font-extrabold text-foreground tracking-tight">
            {type === 'site_visit' ? 'Schedule Site Visit' : 'Contact Developer'}
          </h3>
          
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1 font-medium truncate">
            <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="font-bold text-foreground truncate">{builder.name || builder.builder_name}</span>
            {builder.reraRegistrationNo && (
              <>
                <span>•</span>
                <span className="truncate font-mono">RERA: {builder.reraRegistrationNo}</span>
              </>
            )}
          </div>
        </div>

        {/* Modal Body / Form */}
        <div className="p-6 overflow-y-auto space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Inquiry Type Segment Selector */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-2">
              Inquiry Type
            </label>
            <div className="grid grid-cols-2 gap-2 bg-muted p-1 rounded-2xl border">
              <button
                type="button"
                onClick={() => setType('general')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  type === 'general'
                    ? 'bg-background text-primary shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Phone className="w-4 h-4" />
                <span>Contact Developer</span>
              </button>
              <button
                type="button"
                onClick={() => setType('site_visit')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  type === 'site_visit'
                    ? 'bg-background text-primary shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Schedule Site Visit</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Full Name Input */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3 text-muted-foreground" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className={`w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-background border text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                    validationErrors.fullName ? 'border-rose-500' : 'border-border'
                  }`}
                />
              </div>
              {validationErrors.fullName && (
                <p className="text-[11px] text-rose-500 font-semibold mt-1">{validationErrors.fullName}</p>
              )}
            </div>

            {/* Phone & Email Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Phone Input */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-3 text-muted-foreground" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className={`w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-background border text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                      validationErrors.phone ? 'border-rose-500' : 'border-border'
                    }`}
                  />
                </div>
                {validationErrors.phone && (
                  <p className="text-[11px] text-rose-500 font-semibold mt-1">{validationErrors.phone}</p>
                )}
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className={`w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-background border text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                      validationErrors.email ? 'border-rose-500' : 'border-border'
                    }`}
                  />
                </div>
                {validationErrors.email && (
                  <p className="text-[11px] text-rose-500 font-semibold mt-1">{validationErrors.email}</p>
                )}
              </div>
            </div>

            {/* Date & Time Row (Shown for Site Visit) */}
            {type === 'site_visit' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    Preferred Visit Date <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 absolute left-3.5 top-3 text-muted-foreground" />
                    <input
                      type="date"
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className={`w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-background border text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                        validationErrors.preferredDate ? 'border-rose-500' : 'border-border'
                      }`}
                    />
                  </div>
                  {validationErrors.preferredDate && (
                    <p className="text-[11px] text-rose-500 font-semibold mt-1">{validationErrors.preferredDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    Preferred Slot
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 absolute left-3.5 top-3 text-muted-foreground" />
                    <select
                      value={preferredTime}
                      onChange={(e) => setPreferredTime(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                    >
                      <option value="10:00 AM">10:00 AM - 12:00 PM</option>
                      <option value="12:00 PM">12:00 PM - 02:00 PM</option>
                      <option value="02:00 PM">02:00 PM - 04:00 PM</option>
                      <option value="04:00 PM">04:00 PM - 06:00 PM</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Optional Message Field */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Optional Message / Questions
              </label>
              <div className="relative">
                <MessageSquare className="w-4 h-4 absolute left-3.5 top-3 text-muted-foreground" />
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  placeholder={`Ask ${builder.name} about project availability, floor plans, or pricing...`}
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-xs font-extrabold rounded-xl gap-2 shadow-lg shadow-primary/25"
              >
                {loading ? (
                  <>
                    <ButtonLoader />
                    <span>Submitting Inquiry...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{type === 'site_visit' ? 'Book Site Visit' : 'Send Inquiry'}</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default BuilderInquiryModal;
