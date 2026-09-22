import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  MapPin,
  ShieldCheck,
  Save,
  Plus,
  Package,
  LogOut,
  Camera,
} from 'lucide-react';
import StoreLayout from '../../components/storefront/StoreLayout.jsx';
import UserAvatar from '../../components/common/UserAvatar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { userApi } from '../../services/api.js';

export default function ProfilePage() {
  const { user, setUser, logout } = useAuth();
  const { showSuccess, showError } = useToast();
  const fileRef = useRef(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    mobile: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: true,
  });
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
      });
    }
    loadAddresses();
  }, [user]);

  const loadAddresses = async () => {
    try {
      const data = await userApi.getAddresses();
      if (data.success) {
        setAddresses(data.addresses || []);
      }
    } catch (err) {
      console.error('Failed to load addresses:', err);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      const res = await userApi.updateProfile(formData);
      if (res.success && res.user) {
        setUser(res.user);
        showSuccess('Profile details updated successfully!');
      }
    } catch (err) {
      showError(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    try {
      setSavingAddress(true);
      const res = await userApi.addAddress(addressForm);
      if (res.success) {
        showSuccess('Address added successfully!');
        setShowAddressForm(false);
        setAddressForm({
          fullName: '',
          mobile: '',
          street: '',
          city: '',
          state: '',
          pincode: '',
          isDefault: false,
        });
        await loadAddresses();
      }
    } catch (err) {
      showError(err.message || 'Failed to add address');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showError('Please choose a photo under 2 MB.');
      return;
    }
    try {
      setUploadingPhoto(true);
      const res = await userApi.uploadAvatar(file);
      if (res.success && res.user) {
        setUser(res.user);
        showSuccess('Profile photo updated.');
      }
    } catch (err) {
      showError(err.message || 'Could not upload photo');
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  };

  return (
    <StoreLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Page Header */}
        <div className="mb-8">
          <span className="text-xs uppercase font-bold tracking-widest text-orange-800">
            Account Management
          </span>
          <h1 className="font-serif text-3xl font-bold text-stone-900 mt-1">
            My Profile & Preferences
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Profile Card */}
          <div className="space-y-6">
            <div className="bg-white/80 rounded-3xl border border-gold-200/80 p-6 shadow-soft text-center">
              <div className="relative inline-block mb-4">
                <UserAvatar user={user} size="lg" className="mx-auto" />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-espresso text-gold-300 border border-gold-400/50 flex items-center justify-center shadow-md"
                  aria-label="Upload profile photo"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-gold-700 mb-2">
                {uploadingPhoto ? 'Uploading portrait...' : 'Tap the camera to change photo'}
              </p>

              <h2 className="font-serif text-xl font-bold text-stone-900">
                {user?.name}
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">{user?.email}</p>

              <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Verified Mobile: +91 {user?.mobile}</span>
              </div>
            </div>

            {/* Navigation links */}
            <div className="bg-white rounded-2xl border border-stone-200/80 shadow-soft overflow-hidden divide-y divide-stone-100 text-xs font-semibold">
              <Link
                to="/orders"
                className="flex items-center gap-3 p-4 text-stone-700 hover:text-orange-700 hover:bg-stone-50 transition-colors"
              >
                <Package className="w-4 h-4 text-orange-600" />
                <span>My Orders & History</span>
              </Link>
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 p-4 text-rose-600 hover:bg-rose-50 text-left transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out of Account</span>
              </button>
            </div>
          </div>

          {/* Right Column: Edit Profile & Address Book */}
          <div className="md:col-span-2 space-y-8">
            {/* Edit Profile Form */}
            <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-soft">
              <h3 className="font-serif text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-orange-600" />
                <span>Personal Information</span>
              </h3>

              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                    Mobile Number (Login ID)
                  </label>
                  <input
                    type="text"
                    value={`+91 ${user?.mobile || ''}`}
                    disabled
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-100 text-stone-500 text-sm cursor-not-allowed font-mono"
                  />
                  <span className="text-[10px] text-stone-400 mt-1 block">
                    Mobile number is verified with OTP and locked for security.
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-semibold rounded-xl text-xs shadow-sm hover:opacity-95 transition-all flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{savingProfile ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Saved Delivery Addresses */}
            <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-soft">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-orange-600" />
                  <span>Saved Delivery Addresses</span>
                </h3>

                {!showAddressForm && (
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="flex items-center gap-1 text-xs font-bold text-orange-700 hover:text-orange-900 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-xl transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Address</span>
                  </button>
                )}
              </div>

              {/* Add Address Form */}
              {showAddressForm && (
                <form onSubmit={handleAddressSubmit} className="mb-6 p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-stone-500 block mb-1">Contact Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Priya Sharma"
                        value={addressForm.fullName}
                        onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                        className="w-full p-2.5 rounded-lg border border-stone-200 bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-stone-500 block mb-1">Contact Phone</label>
                      <input
                        type="tel"
                        placeholder="10-digit mobile"
                        value={addressForm.mobile}
                        onChange={(e) => setAddressForm({ ...addressForm, mobile: e.target.value })}
                        className="w-full p-2.5 rounded-lg border border-stone-200 bg-white"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-stone-500 block mb-1">Street Address</label>
                    <input
                      type="text"
                      placeholder="House/Flat No., Apartment, Street, Landmark"
                      value={addressForm.street}
                      onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                      className="w-full p-2.5 rounded-lg border border-stone-200 bg-white text-xs"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-stone-500 block mb-1">City</label>
                      <input
                        type="text"
                        placeholder="e.g. Salem"
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        className="w-full p-2.5 rounded-lg border border-stone-200 bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-stone-500 block mb-1">State</label>
                      <input
                        type="text"
                        placeholder="e.g. Tamil Nadu"
                        value={addressForm.state}
                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                        className="w-full p-2.5 rounded-lg border border-stone-200 bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-stone-500 block mb-1">Pincode</label>
                      <input
                        type="text"
                        placeholder="e.g. 636001"
                        value={addressForm.pincode}
                        onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                        className="w-full p-2.5 rounded-lg border border-stone-200 bg-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="px-4 py-2 text-xs text-stone-600 hover:bg-stone-200 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingAddress}
                      className="px-4 py-2 bg-orange-700 text-white rounded-lg text-xs font-semibold"
                    >
                      {savingAddress ? 'Saving...' : 'Save Address'}
                    </button>
                  </div>
                </form>
              )}

              {/* Address List */}
              {addresses.length === 0 ? (
                <p className="text-xs text-stone-500 italic">
                  No delivery addresses saved yet. Click "Add Address" to store your shipping destination.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="p-4 rounded-2xl border border-stone-200 bg-stone-50/60 text-xs space-y-1 relative"
                    >
                      <span className="font-bold text-stone-900 block">{addr.fullName}</span>
                      <span className="text-stone-500 block font-mono">+91 {addr.mobile}</span>
                      <p className="text-stone-700 leading-relaxed pt-1">
                        {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
