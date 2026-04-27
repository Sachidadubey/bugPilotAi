import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getProfileApi, updateProfileApi } from "../../api/user.api";
import { changePasswordApi } from "../../api/auth.api";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { updateUser } = useAuth();
  const fileRef = useRef();

  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [saving,  setSaving]    = useState(false);
  const [preview, setPreview]   = useState(null);
  const [file,    setFile]      = useState(null);
  const [form,    setForm]      = useState({ name: "", bio: "", phone: "" });
  const [passForm, setPassForm] = useState({ currentPassword: "", newPassword: "" });
  const [changingPass, setChangingPass] = useState(false);

  useEffect(() => {
    getProfileApi().then(({ data }) => {
      setProfile(data.data);
      setForm({ name: data.data.name || "", bio: data.data.bio || "", phone: data.data.phone || "" });
    }).finally(() => setLoading(false));
  }, []);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name",  form.name);
      fd.append("bio",   form.bio);
      fd.append("phone", form.phone);
      if (file) fd.append("avatar", file);

      const { data } = await updateProfileApi(fd);
      setProfile(data.data);
      updateUser({ name: data.data.name });
      toast.success("Profile updated!");
      setFile(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setChangingPass(true);
    try {
      await changePasswordApi(passForm);
      toast.success("Password changed! Please log in again.");
      setPassForm({ currentPassword: "", newPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setChangingPass(false);
    }
  };

  const avatarSrc = preview || profile?.avatar?.url;

  if (loading) return (
    <DashboardLayout>
      <div className="text-center py-5">
        <div className="spinner-border text-primary" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="row g-4">

        {/* Avatar + basic info */}
        <div className="col-lg-4">
          <div className="bp-card text-center">
            {/* Avatar */}
            <div className="position-relative d-inline-block mb-3">
              {avatarSrc ? (
                <img src={avatarSrc} alt="avatar"
                  className="rounded-circle object-fit-cover"
                  style={{ width: 96, height: 96, border: "3px solid #eef2ff" }} />
              ) : (
                <div className="d-flex align-items-center justify-content-center rounded-circle bg-primary text-white fw-bold mx-auto"
                  style={{ width: 96, height: 96, fontSize: 36 }}>
                  {profile?.name?.[0]?.toUpperCase()}
                </div>
              )}
              <button type="button"
                onClick={() => fileRef.current?.click()}
                className="position-absolute bottom-0 end-0 btn btn-sm btn-primary rounded-circle p-1"
                style={{ width: 28, height: 28 }}>
                <i className="bi bi-camera-fill" style={{ fontSize: 12 }}></i>
              </button>
              <input ref={fileRef} type="file" className="d-none"
                accept="image/*" onChange={handleFileChange} />
            </div>

            <h5 className="fw-bold mb-1">{profile?.name}</h5>
            <p className="text-muted small mb-2">{profile?.email}</p>

            <span className={`badge px-3 py-2 ${profile?.subscription === "pro" ? "badge-pro" : "badge-free"}`}>
              {profile?.subscription === "pro"
                ? <><i className="bi bi-lightning-fill me-1" />Pro Plan</>
                : "Free Plan"}
            </span>

            <hr className="my-3" />

            <div className="text-start">
              <div className="d-flex align-items-center gap-2 mb-2">
                <i className="bi bi-shield-check text-success"></i>
                <span className="small text-muted">Email verified</span>
              </div>
              <div className="d-flex align-items-center gap-2 mb-2">
                <i className="bi bi-calendar3 text-primary"></i>
                <span className="small text-muted">
                  Joined {new Date(profile?.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                </span>
              </div>
              {profile?.phone && (
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-phone text-muted"></i>
                  <span className="small text-muted">{profile?.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Edit form */}
        <div className="col-lg-8">
          {/* Profile form */}
          <div className="bp-card mb-4">
            <h6 className="fw-bold mb-4">Edit Profile</h6>
            <form onSubmit={handleProfileSave}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Full Name</label>
                  <input type="text" className="form-control"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Phone</label>
                  <input type="text" className="form-control"
                    placeholder="Optional"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-semibold">Bio</label>
                  <textarea className="form-control" rows={3}
                    placeholder="Tell us about yourself..."
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })} />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-semibold">Email Address</label>
                  <input type="email" className="form-control bg-light"
                    value={profile?.email} disabled />
                  <div className="form-text">Email cannot be changed</div>
                </div>
              </div>

              {file && (
                <div className="alert alert-info py-2 mt-3 d-flex align-items-center gap-2">
                  <i className="bi bi-image"></i>
                  <span className="small">New avatar selected: {file.name}</span>
                  <button type="button" className="btn-close ms-auto btn-sm"
                    onClick={() => { setFile(null); setPreview(null); }} />
                </div>
              )}

              <div className="mt-4">
                <button type="submit" className="btn btn-primary px-4 fw-semibold" disabled={saving}>
                  {saving
                    ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</>
                    : <><i className="bi bi-check-circle me-2" />Save Changes</>}
                </button>
              </div>
            </form>
          </div>

          {/* Change password */}
          <div className="bp-card">
            <h6 className="fw-bold mb-4">Change Password</h6>
            <form onSubmit={handlePasswordChange}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Current Password</label>
                  <input type="password" className="form-control" required
                    value={passForm.currentPassword}
                    onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">New Password</label>
                  <input type="password" className="form-control" required
                    placeholder="Min 8 chars, 1 uppercase, 1 number"
                    value={passForm.newPassword}
                    onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })} />
                </div>
              </div>
              <div className="mt-3">
                <button type="submit" className="btn btn-outline-danger px-4 fw-semibold"
                  disabled={changingPass}>
                  {changingPass
                    ? <><span className="spinner-border spinner-border-sm me-2" />Changing...</>
                    : <><i className="bi bi-lock me-2" />Change Password</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}