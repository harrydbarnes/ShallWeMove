import React, { useState } from 'react';
import {
  X,
  Download,
  Upload,
  Trash2,
  CheckCircle2,
  AlertCircle,
  HardDrive,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({ isOpen, onClose }) => {
  const { exportBackup, importBackup, clearAllData, listings, currentHouses } = useApp();

  const [importJsonText, setImportJsonText] = useState('');
  const [importStatus, setImportStatus] = useState<'success' | 'error' | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        importBackup(text);
        setImportStatus('success');
        setTimeout(() => {
          onClose();
        }, 1200);
      } catch (err: any) {
        setImportStatus('error');
        setErrorMessage(err.message || 'Failed to import JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleTextImport = () => {
    try {
      importBackup(importJsonText);
      setImportStatus('success');
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setImportStatus('error');
      setErrorMessage(err.message || 'Invalid JSON format.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full overflow-hidden flex flex-col text-xs">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <HardDrive className="w-4 h-4 text-brand-600" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Backup & Restore (JSON)
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Export section */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
              <Download className="w-4 h-4 text-brand-600" />
              <span>Export Local Backup</span>
            </h4>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
              Download your current house profile, {listings.length} listings, and priorities into an offline JSON file.
            </p>
            <button
              onClick={exportBackup}
              className="mt-1 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-semibold flex items-center space-x-1.5 shadow-sm transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download JSON Backup</span>
            </button>
          </div>

          {/* Import section */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
              <Upload className="w-4 h-4 text-brand-600" />
              <span>Restore from Backup</span>
            </h4>
            <p className="text-slate-500 dark:text-slate-400 text-[11px]">
              Select a previously exported JSON backup file or paste its contents below.
            </p>

            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-200 dark:file:bg-slate-700 file:text-slate-700 dark:file:text-slate-200 hover:file:bg-slate-300"
            />

            <div className="pt-2">
              <textarea
                rows={3}
                placeholder="Or paste backup JSON content directly here..."
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                className="w-full font-mono text-[11px] p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
              {importJsonText && (
                <button
                  onClick={handleTextImport}
                  className="mt-2 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-semibold"
                >
                  Import Pasted JSON
                </button>
              )}
            </div>

            {importStatus === 'success' && (
              <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Backup restored successfully!</span>
              </div>
            )}

            {importStatus === 'error' && (
              <div className="p-2.5 rounded-lg bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold flex items-center space-x-1.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          {/* Reset / Clear Data */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-[11px]">
            <span className="text-slate-400">Want to start completely fresh?</span>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to clear all your saved listings and reset Shall We Move?')) {
                  clearAllData();
                  onClose();
                }
              }}
              className="text-rose-600 hover:text-rose-700 dark:hover:text-rose-400 font-semibold flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
