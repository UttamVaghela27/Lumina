import React from 'react';

const PersonalInfo = ({ formData, isEdit, setIsEdit, handleChange, handleAddressChange, handleSave }) => {
  return (
    <div className="content-card">
      <h2>Personal Information</h2>
      <form className="profile-form">
        <div className="form-row">
          <div className="form-group half-width">
            <label className="form-label">First Name</label>
            <input type="text" className="form-control"
              name="firstname"
              value={formData.firstname}
              onChange={handleChange}
              disabled={!isEdit}
            />
          </div>
          <div className="form-group half-width">
            <label className="form-label">Last Name</label>
            <input type="text" className="form-control"
              name="lastname"
              value={formData.lastname}
              onChange={handleChange}
              disabled={!isEdit}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group half-width">
            <label className="form-label">Email Address</label>
            <input type="email" className="form-control"
              name="email"
              value={formData.email}
              disabled
              placeholder="Email"
            />
          </div>
          <div className="form-group half-width">
            <label className="form-label">Phone Number</label>
            <input type="tel" className="form-control"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={!isEdit}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group half-width">
            <label className="form-label">Address</label>
            <input type="text" className="form-control" placeholder="House/Flat No., Building Name"
              name="buildingName"
              value={formData.address[0].buildingName}
              onChange={(e) => handleAddressChange(0, 'buildingName', e.target.value)}
              disabled={!isEdit}
            />
          </div>
          <div className="form-group half-width">
            <label className="form-label">Street</label>
            <input type="text" className="form-control" placeholder="Area, Street, Sector, Village"
              name="street"
              value={formData.address[0]?.street}
              onChange={(e) => handleAddressChange(0, 'street', e.target.value)}
              disabled={!isEdit}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group half-width">
            <label className="form-label">City</label>
            <input type="text" className="form-control" placeholder="Town/City"
              name="city"
              value={formData.address[0]?.city}
              onChange={(e) => handleAddressChange(0, 'city', e.target.value)}
              disabled={!isEdit}
            />
          </div>
          <div className="form-group half-width">
            <label className="form-label">State</label>
            <input type="text" className="form-control" placeholder="State"
              name="state"
              value={formData.address[0]?.state}
              onChange={(e) => handleAddressChange(0, 'state', e.target.value)}
              disabled={!isEdit}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group half-width">
            <label className="form-label">Pincode</label>
            <input type="text" className="form-control" placeholder="Pincode"
              name="pincode"
              value={formData.address[0]?.pincode}
              onChange={(e) => handleAddressChange(0, 'pincode', e.target.value)}
              disabled={!isEdit}
            />
          </div>
          <div className="form-group half-width">
            <label className="form-label">Country</label>
            <input type="text" className="form-control" placeholder="Country"
              name="country"
              value={formData.address[0].country}
              onChange={(e) => handleAddressChange(0, 'country', e.target.value)}
              disabled={!isEdit}
            />
          </div>
        </div>

        <div className="form-actions profile-form-actions">
          {
            !isEdit ? (
              <button type="button"
                onClick={() => setIsEdit(true)}
                className="btn btn-outline profile-flex-1">Edit</button>
            ) : (
              <button type="button"
                onClick={handleSave}
                className="btn btn-primary profile-flex-1">Save Changes</button>
            )
          }
        </div>
      </form>
    </div>
  );
};

export default PersonalInfo;
