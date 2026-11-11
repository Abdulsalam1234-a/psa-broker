import React from 'react';
import { Order, Stock } from '../../types';
import { formatNaira } from '../../services/feeEngine';
import { 
  FileText, 
  Printer, 
  Download, 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  Building, 
  Calendar, 
  Hash, 
  User, 
  ExternalLink 
} from 'lucide-react';

interface ContractNoteModalProps {
  order: Order | null;
  stock?: Stock | null;
  isOpen: boolean;
  onClose: () => void;
  clientName: string;
}

export const ContractNoteModal: React.FC<ContractNoteModalProps> = ({
  order,
  stock,
  isOpen,
  onClose,
  clientName,
}) => {
  if (!isOpen || !order) return null;

  const noteNumber = order.contractNoteNumber || `CSCS/PSA/2026/${order.id.slice(-6).toUpperCase()}`;
  const tradeDate = order.executedAt 
    ? new Date(order.executedAt).toLocaleString('en-GB', { timeZone: 'Africa/Lagos' })
    : new Date().toLocaleString('en-GB', { timeZone: 'Africa/Lagos' });

  // Settlement T+1
  const settlementDate = new Date(Date.now() + 86400000).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const isBuy = order.orderSide === 'BUY';
  const unitPrice = order.executionPrice || (order.quantity > 0 ? order.grossAmount / order.quantity : 0);
  const companyName = stock?.name || order.ticker;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-navy-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      
      <div className="relative w-full max-w-3xl bg-navy-900 border border-gold-500/40 rounded-2xl shadow-2xl overflow-hidden my-8 print:m-0 print:border-none print:shadow-none print:bg-white print:text-black">
        
        {/* Top Control Bar (Hidden in Print) */}
        <div className="bg-navy-950 px-6 py-3 border-b border-navy-800 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-gold-400" />
            <span className="font-bold text-white text-sm">
              Official CSCS / NGX Contract Note
            </span>
            <span className="text-[10px] bg-bull/20 text-bull border border-bull/30 px-2 py-0.5 rounded-full font-mono font-bold">
              EXECUTED & CLEARED
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-gold-300 border border-gold-500/30 text-xs font-semibold transition-all shadow-sm"
              title="Print official document or Save to PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-navy-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Contract Note Body */}
        <div className="p-6 sm:p-8 bg-gradient-to-b from-navy-900 to-navy-950 text-slate-100 font-sans print:bg-white print:text-black print:p-4">
          
          {/* Institutional Header */}
          <div className="border-b-2 border-gold-500/40 pb-6 mb-6 flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-white print:text-black tracking-tight">
                  PSA <span className="text-gold-400 print:text-amber-700">SECURITIES</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-navy-800 print:bg-gray-200 border border-gold-500/30 text-gold-300 print:text-black font-mono font-bold">
                  DEALING MEMBER
                </span>
              </div>
              <div className="text-xs text-slate-400 print:text-gray-600 mt-1 space-y-0.5">
                <p>PSA Omnitech Securities & Broking Ltd (A Member of NGX Group)</p>
                <p>SEC Registration: SEC/PSA/NGX/2026/0491 | Clearing Member No: 3948</p>
                <p>In Strategic Partnership with <strong className="text-gold-400 print:text-black">Naira Stock Academy</strong></p>
              </div>
            </div>

            <div className="text-left sm:text-right font-mono">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 print:text-gray-500 font-bold">
                Contract Note No.
              </div>
              <div className="text-sm font-black text-gold-400 print:text-amber-800">
                {noteNumber}
              </div>
              <div className="text-xs text-slate-400 print:text-gray-600 mt-1">
                Settlement Cycle: <strong className="text-slate-200 print:text-black">T+1 (WAT)</strong>
              </div>
              <div className="text-xs text-slate-400 print:text-gray-600">
                Settlement Date: <strong className="text-slate-200 print:text-black">{settlementDate}</strong>
              </div>
            </div>
          </div>

          {/* Client & Clearing Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-navy-850/70 print:bg-gray-50 border border-navy-750 print:border-gray-200 text-xs mb-6">
            <div>
              <div className="text-slate-400 print:text-gray-500 uppercase text-[10px] font-bold">
                Account Holder (Client)
              </div>
              <div className="font-bold text-white print:text-black text-sm mt-0.5">
                {clientName}
              </div>
              <div className="text-slate-400 print:text-gray-600 font-mono text-[11px]">
                Account ID: {order.accountId} • User Ref: {order.userId.slice(0, 10)}
              </div>
            </div>

            <div>
              <div className="text-slate-400 print:text-gray-500 uppercase text-[10px] font-bold">
                Clearing & Depository Agency
              </div>
              <div className="font-bold text-white print:text-black text-sm mt-0.5">
                Central Securities Clearing System (CSCS) Plc
              </div>
              <div className="text-slate-400 print:text-gray-600 font-mono text-[11px]">
                Trade Timestamp: {tradeDate}
              </div>
            </div>
          </div>

          {/* Trade Execution Specification Table */}
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-navy-700 print:border-gray-300 text-slate-400 print:text-gray-600 font-mono text-[11px]">
                  <th className="py-2.5 px-3">SIDE</th>
                  <th className="py-2.5 px-3">SECURITY</th>
                  <th className="py-2.5 px-3 text-right">QUANTITY</th>
                  <th className="py-2.5 px-3 text-right">UNIT PRICE</th>
                  <th className="py-2.5 px-3 text-right">GROSS CONSIDERATION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800 print:divide-gray-200 font-mono">
                <tr>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isBuy 
                        ? 'bg-bull/20 text-bull border border-bull/30 print:bg-green-100 print:text-green-800' 
                        : 'bg-bear/20 text-bear border border-bear/30 print:bg-red-100 print:text-red-800'
                    }`}>
                      {order.orderSide}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-white print:text-black text-sm">{order.ticker}</div>
                    <div className="text-slate-400 print:text-gray-500 text-[10px] font-sans">{companyName}</div>
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-white print:text-black">
                    {order.quantity.toLocaleString()} Units
                  </td>
                  <td className="py-3 px-3 text-right text-slate-200 print:text-black">
                    ₦{unitPrice.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-white print:text-black">
                    {formatNaira(order.grossAmount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Statutory Fee Breakdown Itemization */}
          <div className="p-4 rounded-xl bg-navy-850/50 print:bg-gray-50 border border-navy-750 print:border-gray-200 mb-6 text-xs">
            <div className="font-bold text-slate-300 print:text-black mb-2 flex items-center justify-between">
              <span>STATUTORY & REGULATORY LEVIES ITEMIZED</span>
              <span className="text-[11px] font-mono text-slate-400">Total Statutory ~1.4775%</span>
            </div>

            <div className="space-y-1.5 text-slate-300 print:text-gray-700 font-mono text-[11px]">
              <div className="flex justify-between">
                <span>Brokerage Dealing Commission (0.70%):</span>
                <span>{formatNaira(order.feeBreakdown.brokerFee)}</span>
              </div>
              <div className="flex justify-between">
                <span>Securities & Exchange Commission Fee (SEC 0.30%):</span>
                <span>{formatNaira(order.feeBreakdown.secFee)}</span>
              </div>
              <div className="flex justify-between">
                <span>Central Securities Clearing System Fee (CSCS 0.35%):</span>
                <span>{formatNaira(order.feeBreakdown.cscsFee)}</span>
              </div>
              <div className="flex justify-between">
                <span>Federal Stamp Duty (FIRS 0.075%):</span>
                <span>{formatNaira(order.feeBreakdown.stampDuty)}</span>
              </div>
              <div className="flex justify-between">
                <span>Value Added Tax (7.5% on Brokerage Fee):</span>
                <span>{formatNaira(order.feeBreakdown.vatFee)}</span>
              </div>

              <div className="border-t border-navy-700 print:border-gray-300 pt-2 flex justify-between font-bold text-slate-200 print:text-black text-xs">
                <span>Total Transaction Levies:</span>
                <span className="text-gold-400 print:text-amber-800">{formatNaira(order.feeDeducted)}</span>
              </div>
            </div>
          </div>

          {/* Net Settlement Total */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-navy-800 to-navy-850 print:bg-gray-100 border-2 border-gold-500/50 flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-gold-400 print:text-amber-800 font-bold">
                {isBuy ? 'TOTAL NET PAYABLE BY CLIENT' : 'TOTAL NET PROCEEDS RECEIVABLE'}
              </div>
              <div className="text-xs text-slate-400 print:text-gray-600">
                {isBuy ? 'Gross Consideration + Statutory Fees' : 'Gross Proceeds - Statutory Fees'}
              </div>
            </div>

            <div className="text-2xl sm:text-3xl font-black text-white print:text-black font-mono">
              {formatNaira(order.netAmount)}
            </div>
          </div>

          {/* Legal Certification & CSCS Digital Stamp */}
          <div className="pt-4 border-t border-navy-800 print:border-gray-300 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-400 print:text-gray-500">
            <div className="max-w-md">
              <p className="font-semibold text-slate-300 print:text-black mb-0.5">
                Investments & Securities Act (ISA 2007) Disclaimer:
              </p>
              <p>
                This trade was executed subject to the Rules and Regulations of the Nigerian Exchange Group (NGX) and Central Securities Clearing System (CSCS) Plc. Contract confirmation is issued electronically by PSA Omnitech.
              </p>
            </div>

            {/* Official Digital Stamp Box */}
            <div className="p-2.5 rounded-lg border-2 border-dashed border-gold-500/60 print:border-amber-700 text-center font-mono shrink-0">
              <div className="text-[9px] font-black text-gold-400 print:text-amber-800 uppercase tracking-widest">
                ★ CSCS ELECTRONIC CLEAR ★
              </div>
              <div className="text-[8px] text-slate-300 print:text-black">
                T+1 SETTLEMENT GUARANTEED
              </div>
              <div className="text-[8px] text-slate-400 print:text-gray-500">
                REF: {order.id.slice(0, 12).toUpperCase()}
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
