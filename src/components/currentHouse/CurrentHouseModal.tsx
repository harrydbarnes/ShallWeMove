import React, { useState } from 'react';
import {
  X,
  Home,
  PoundSterling,
  Heart,
  AlertTriangle,
  Plus,
  Trash2,
  Check,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CurrentHouseProfile } from '../../types/property';
import { generateAutoSuggestions } from '../../lib/scoring/autoSuggestions';
import { AddressSearchInput } from '../address/AddressSearchInput';
import { Tooltip } from '../ui/Tooltip';
import { CurrentHouseRightmoveImport } from './CurrentHouseRightmoveImport';

interface CurrentHouseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CurrentHouseModal: React.FC<CurrentHouseModalProps> = ({ isOpen, onClose }) => {
  const {
    currentHouses,
    activeCurrentHouse,
    updateCurrentHouse,
    addCurrentHouse,
    deleteCurrentHouse,
    applySuggestedWants,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'details' | 'finances' | 'likes_frustrations'>('details');

  // Form state initialized from activeCurrentHouse
  const [profileName, setProfileName] = useState(activeCurrentHouse.profileName);
  const [address, setAddress] = useState(activeCurrentHouse.displayAddress);
  const [postcode, setPostcode] = useState(activeCurrentHouse.postcode || '');
  const [propertyType, setPropertyType] = useState(activeCurrentHouse.propertyType);
  const [tenure, setTenure] = useState(activeCurrentHouse.tenure);
  const [bedrooms, setBedrooms] = useState(activeCurrentHouse.bedrooms);
  const [bathrooms, setBathrooms] = useState(activeCurrentHouse.bathrooms);
  const [receptions, setReceptions] = useState(activeCurrentHouse.receptions);
  const [floorAreaSqFt, setFloorAreaSqFt] = useState<number | ''>(activeCurrentHouse.floorAreaSqFt || '');
  const [parkingSpaces, setParkingSpaces] = useState(activeCurrentHouse.parkingSpaces);
  const [garageType, setGarageType] = useState(activeCurrentHouse.garageType);
  const [gardenOrientation, setGardenOrientation] = useState(activeCurrentHouse.gardenOrientation);
  const [hasGarden, setHasGarden] = useState(activeCurrentHouse.hasGarden);
  const [loftStatus, setLoftStatus] = useState(activeCurrentHouse.loftStatus);
  const [councilTaxBand, setCouncilTaxBand] = useState(activeCurrentHouse.councilTaxBand);
  const [epcRating, setEpcRating] = useState(activeCurrentHouse.epcRating);

  // Financials
  const [estimatedValue, setEstimatedValue] = useState(activeCurrentHouse.estimatedCurrentValue ?? 0);
  const [mortgageRemaining, setMortgageRemaining] = useState(activeCurrentHouse.outstandingMortgage ?? 0);
  const [interestRate, setInterestRate] = useState(activeCurrentHouse.currentInterestRate ?? 0);
  const [mortgageMonthly, setMortgageMonthly] = useState(activeCurrentHouse.monthlyCosts.monthlyMortgageOrRent ?? 0);
  const [councilTaxMonthly, setCouncilTaxMonthly] = useState(activeCurrentHouse.monthlyCosts.monthlyCouncilTax ?? 0);
  const [energyMonthly, setEnergyMonthly] = useState(activeCurrentHouse.monthlyCosts.monthlyEnergy ?? 0);
  const [waterMonthly, setWaterMonthly] = useState(activeCurrentHouse.monthlyCosts.monthlyWater ?? 0);
  const [serviceChargeMonthly, setServiceChargeMonthly] = useState(activeCurrentHouse.monthlyCosts.monthlyServiceCharge ?? 0);
  const [groundRentMonthly, setGroundRentMonthly] = useState(activeCurrentHouse.monthlyCosts.monthlyGroundRent ?? 0);

  // Likes & Frustrations
  const [likesText, setLikesText] = useState(activeCurrentHouse.thingsWeLove.join('\n'));
  const [frustrationsText, setFrustrationsText] = useState(activeCurrentHouse.frustrations.join('\n'));
  const [showRightmoveImport, setShowRightmoveImport] = useState(false);

  const handleImportRightmove = (imported: Partial<CurrentHouseProfile>) => {
    if (imported.displayAddress) setAddress(imported.displayAddress);
    if (imported.postcode) setPostcode(imported.postcode);
    if (imported.propertyType) setPropertyType(imported.propertyType);
    if (imported.tenure) setTenure(imported.tenure);
    if (imported.bedrooms !== undefined) setBedrooms(imported.bedrooms);
    if (imported.bathrooms !== undefined) setBathrooms(imported.bathrooms);
    if (imported.receptions !== undefined) setReceptions(imported.receptions);
    if (imported.floorAreaSqFt !== undefined) setFloorAreaSqFt(imported.floorAreaSqFt);
    if (imported.parkingSpaces !== undefined) setParkingSpaces(imported.parkingSpaces);
    if (imported.garageType) setGarageType(imported.garageType);
    if (imported.gardenOrientation) setGardenOrientation(imported.gardenOrientation);
    if (imported.hasGarden !== undefined) setHasGarden(imported.hasGarden);
    if (imported.loftStatus) setLoftStatus(imported.loftStatus);
    if (imported.councilTaxBand) setCouncilTaxBand(imported.councilTaxBand);
    if (imported.epcRating) setEpcRating(imported.epcRating);
    if (imported.estimatedCurrentValue !== undefined) setEstimatedValue(imported.estimatedCurrentValue);
    if (imported.thingsWeLove && imported.thingsWeLove.length > 0) {
      setLikesText(imported.thingsWeLove.join('\n'));
    }
    setShowRightmoveImport(false);
  };

  if (!isOpen) return null;

  const handleSave = () => {
    const updated: CurrentHouseProfile = {
      ...activeCurrentHouse,
      profileName,
      displayAddress: address,
      postcode: postcode || undefined,
      propertyType: propertyType as any,
      tenure: tenure as any,
      bedrooms,
      bathrooms,
      receptions,
      floorAreaSqFt: typeof floorAreaSqFt === 'number' ? floorAreaSqFt : undefined,
      floorAreaSqM: typeof floorAreaSqFt === 'number' ? Math.round((floorAreaSqFt / 10.7639) * 10) / 10 : undefined,
      parkingSpaces,
      garageType: garageType as any,
      hasDriveway: parkingSpaces > 0,
      gardenOrientation: gardenOrientation as any,
      hasGarden,
      loftStatus: loftStatus as any,
      councilTaxBand: councilTaxBand as any,
      epcRating: epcRating as any,
      estimatedCurrentValue: estimatedValue,
      outstandingMortgage: mortgageRemaining,
      currentInterestRate: interestRate,
      monthlyCosts: {
        monthlyMortgageOrRent: mortgageMonthly,
        monthlyCouncilTax: councilTaxMonthly,
        monthlyEnergy: energyMonthly,
        monthlyWater: waterMonthly,
        monthlyServiceCharge: serviceChargeMonthly,
        monthlyGroundRent: groundRentMonthly,
        monthlyInsurance: 30,
      },
      thingsWeLove: likesText.split('\n').map((l) => l.trim()).filter(Boolean),
      frustrations: frustrationsText.split('\n').map((f) => f.trim()).filter(Boolean),
      updatedAt: new Date().toISOString(),
    };

    updateCurrentHouse(updated);

    // Propose updated wants suggestions
    const suggestions = generateAutoSuggestions(updated);
    applySuggestedWants(suggestions);

    onClose();
  };

  const handleCreateNewProfile = () => {
    const newId = `current_profile_${Date.now()}`;
    const newProf: CurrentHouseProfile = {
      ...activeCurrentHouse,
      id: newId,
      profileName: `Second Home / Profile ${currentHouses.length + 1}`,
      displayAddress: 'New Address, UK',
    };
    addCurrentHouse(newProf);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <Home className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Current Home Profile
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Baseline data used for delta calculations and auto-suggested wants
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 px-5 pt-2">
          <button
            onClick={() => setActiveSubTab('details')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition ${
              activeSubTab === 'details'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Property Attributes
          </button>
          <button
            onClick={() => setActiveSubTab('finances')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition ${
              activeSubTab === 'finances'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Value & Monthly Costs
          </button>
          <button
            onClick={() => setActiveSubTab('likes_frustrations')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition ${
              activeSubTab === 'likes_frustrations'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Loves & Frustrations
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeSubTab === 'details' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Search address or import specs from a Rightmove or Zoopla listing
                </p>
                <button
                  type="button"
                  onClick={() => setShowRightmoveImport((prev) => !prev)}
                  className="inline-flex items-center space-x-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 bg-brand-50 dark:bg-brand-950/40 px-2.5 py-1.5 rounded-lg border border-brand-200 dark:border-brand-800 transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{showRightmoveImport ? 'Hide listing import' : 'Import from Rightmove or Zoopla'}</span>
                </button>
              </div>

              {showRightmoveImport && (
                <CurrentHouseRightmoveImport
                  onImport={handleImportRightmove}
                  onCancel={() => setShowRightmoveImport(false)}
                />
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Profile Nickname
                  </label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-slate-700 dark:text-slate-300">
                      Address
                    </label>
                    <span className="text-[10px] text-slate-400">Type to search UK addresses</span>
                  </div>
                  <AddressSearchInput
                    value={address}
                    onChange={setAddress}
                    onSelectAddress={(s) => {
                      setAddress(s.displayName);
                      if (s.postcode) setPostcode(s.postcode);
                    }}
                    placeholder="Search address or postcode..."
                  />
                </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Property Type
                </label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="terraced">Terraced</option>
                  <option value="semi-detached">Semi-Detached</option>
                  <option value="detached">Detached</option>
                  <option value="flat">Flat / Apartment</option>
                  <option value="bungalow">Bungalow</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tenure
                </label>
                <select
                  value={tenure}
                  onChange={(e) => setTenure(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="freehold">Freehold</option>
                  <option value="leasehold">Leasehold</option>
                  <option value="share_of_freehold">Share of Freehold</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Bedrooms
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Bathrooms
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={bathrooms}
                  onChange={(e) => setBathrooms(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Floor Area (sq ft)
                </label>
                <input
                  type="number"
                  value={floorAreaSqFt}
                  onChange={(e) => setFloorAreaSqFt(e.target.value ? parseInt(e.target.value, 10) : '')}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Parking Spaces (Off-street)
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={parkingSpaces}
                  onChange={(e) => setParkingSpaces(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Garden Orientation
                </label>
                <select
                  value={gardenOrientation}
                  onChange={(e) => setGardenOrientation(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="south">South Facing</option>
                  <option value="south_west">South-West</option>
                  <option value="west">West Facing</option>
                  <option value="east">East Facing</option>
                  <option value="north">North Facing</option>
                  <option value="none">No Garden</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Loft Status
                </label>
                <select
                  value={loftStatus}
                  onChange={(e) => setLoftStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="not_mentioned">No accessible storage</option>
                  <option value="boarded">Boarded for storage</option>
                  <option value="boarded_with_ladder_light">Boarded with Ladder & Light</option>
                  <option value="converted_with_building_regs">Converted with Building Regs</option>
                </select>
              </div>
            </div>
          </div>
          )}

          {activeSubTab === 'finances' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Estimated Current Market Value (£)
                  </label>
                  <input
                    type="number"
                    step="5000"
                    value={estimatedValue}
                    onChange={(e) => setEstimatedValue(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <div className="flex items-center space-x-1.5 mb-1">
                    <label className="block font-semibold text-slate-700 dark:text-slate-300">
                      Outstanding Mortgage Balance (£)
                    </label>
                    <Tooltip
                      content={
                        <div className="space-y-1.5 text-[11px] text-slate-200">
                          <p className="font-bold text-amber-300">What should you include?</p>
                          <p>
                            Enter your total redemption figure: your current principal balance <strong>plus any Early Repayment Charge (ERC)</strong>, discharge/exit administration fees, and accrued daily interest.
                          </p>
                          <p className="text-slate-300">
                            💡 If you are unsure, request an official <strong>redemption statement</strong> from your mortgage lender for the exact payoff balance.
                          </p>
                        </div>
                      }
                    />
                  </div>
                  <input
                    type="number"
                    step="5000"
                    value={mortgageRemaining}
                    onChange={(e) => setMortgageRemaining(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <h4 className="font-bold text-slate-800 dark:text-slate-200 pt-2 border-t border-slate-200 dark:border-slate-800">
                Current Monthly Outgoings
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-500 mb-1">Mortgage / Rent (£/mo)</label>
                  <input
                    type="number"
                    value={mortgageMonthly}
                    onChange={(e) => setMortgageMonthly(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-500 mb-1">Council Tax (£/mo)</label>
                  <input
                    type="number"
                    value={councilTaxMonthly}
                    onChange={(e) => setCouncilTaxMonthly(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-500 mb-1">Energy (Gas+Elec) (£/mo)</label>
                  <input
                    type="number"
                    value={energyMonthly}
                    onChange={(e) => setEnergyMonthly(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-500 mb-1">Water (£/mo)</label>
                  <input
                    type="number"
                    value={waterMonthly}
                    onChange={(e) => setWaterMonthly(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-500 mb-1">Service Charge (£/mo)</label>
                  <input
                    type="number"
                    value={serviceChargeMonthly}
                    onChange={(e) => setServiceChargeMonthly(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'likes_frustrations' && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-emerald-700 dark:text-emerald-400 mb-1 flex items-center space-x-1.5">
                  <Heart className="w-4 h-4" />
                  <span>What do you LOVE about this house? (One per line)</span>
                </label>
                <textarea
                  rows={4}
                  value={likesText}
                  onChange={(e) => setLikesText(e.target.value)}
                  placeholder="e.g. Original fireplaces and character&#10;Quiet street with lovely neighbours&#10;Walking distance to park"
                  className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-rose-700 dark:text-rose-400 mb-1 flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>What FRUSTRATES you about this house? (One per line)</span>
                </label>
                <textarea
                  rows={4}
                  value={frustrationsText}
                  onChange={(e) => setFrustrationsText(e.target.value)}
                  placeholder="e.g. No off-street parking&#10;Garden gets no sun after 3pm&#10;Need a dedicated 3rd bedroom for home office"
                  className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Frustrations are automatically analysed to suggest relevant wants in the priorities builder!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={handleCreateNewProfile}
            className="text-xs text-brand-600 dark:text-brand-400 hover:underline flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Another Current House Profile</span>
          </button>

          <button
            onClick={handleSave}
            className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
          >
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );
};
