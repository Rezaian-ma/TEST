import React, { useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import { FaTree, FaSearch, FaPlus, FaMinus } from "react-icons/fa";
import Modal from "react-modal";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css";

Modal.setAppElement("#root");

const App = () => {
  const [markers, setMarkers] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [newMarker, setNewMarker] = useState(null);
  const [formData, setFormData] = useState({ trees: "", description: "" });
  const [searchLocation, setSearchLocation] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const mapRef = useRef(null);

  // Component برای اضافه کردن نقاط روی نقشه
  const AddMarker = () => {
    useMapEvents({
      click: (e) => {
        setNewMarker(e.latlng); // ذخیره مختصات نقطه کلیک شده
        setModalIsOpen(true); // نمایش Modal برای وارد کردن اطلاعات
      },
    });
    return null;
  };

  // ثبت اطلاعات درخت
  const handleSubmit = (e) => {
    e.preventDefault();
    if (newMarker) {
      const date = new Date().toLocaleString();
      setMarkers([...markers, { position: newMarker, ...formData, date }]); // ذخیره داده‌ها
      setFormData({ trees: "", description: "" }); // پاک کردن فرم
      setModalIsOpen(false); // بستن Modal
      setSidebarOpen(true); // باز کردن نوار کناری
    }
  };

  // جستجوی مکان
  const handleSearch = async () => {
    if (!searchLocation) return;
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${searchLocation}&format=json`
      );
      const data = await response.json();
      if (data.length > 0) {
        const { lat, lon } = data[0];
        const map = mapRef.current;
        if (map) {
          map.setView([parseFloat(lat), parseFloat(lon)], 13); // انتقال به مکان جستجو شده
        }
      } else {
        alert("مکان یافت نشد. لطفاً دوباره امتحان کنید.");
      }
    } catch (error) {
      console.error("خطا در جستجوی مکان:", error);
    }
  };

  // تغییر نمای نقشه به موقعیت اولیه
  const resetMapView = () => {
    const map = mapRef.current;
    if (map) {
      map.setView([32.4279, 53.6880], 6); // موقعیت اولیه (ایران)
    }
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <h1>
          <FaTree className="tree-icon" /> پروژه ثبت درخت
        </h1>
        <p>با کلیک روی نقشه، مکان درختان خود را ثبت کنید و درخت بکارید!</p>
        <div className="search-bar">
          <input
            type="text"
            placeholder="جستجوی مکان..."
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
          />
          <button onClick={handleSearch}>
            <FaSearch />
          </button>
        </div>
      </header>

      {/* Main Section */}
      <div className="main">
        <div className="map-container">
          <MapContainer
            center={[32.4279, 53.6880]} // مرکز ایران
            zoom={6}
            ref={mapRef}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <AddMarker />
            {markers.map((marker, idx) => (
              <Marker
                key={idx}
                position={marker.position}
                icon={L.icon({
                  iconUrl: "https://cdn-icons-png.flaticon.com/512/620/620885.png", // آیکون درخت
                  iconSize: [32, 32],
                })}
              >
                <Popup>
                  <strong>تعداد درخت‌ها:</strong> {marker.trees}
                  <br />
                  <strong>توضیحات:</strong> {marker.description}
                  <br />
                  <strong>تاریخ ثبت:</strong> {marker.date}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
          <div className="map-controls">
            <button onClick={() => resetMapView()}>
              <FaPlus /> بزرگ‌نمایی
            </button>
            <button onClick={() => resetMapView()}>
              <FaMinus /> بازنشانی
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <h2>اطلاعات ثبت‌شده</h2>
          {markers.length === 0 ? (
            <p>هیچ نقطه‌ای ثبت نشده است.</p>
          ) : (
            <ul>
              {markers.map((marker, idx) => (
                <li key={idx}>
                  <strong>نقطه {idx + 1}:</strong> {marker.trees} درخت -{" "}
                  {marker.description}
                  <br />
                  <span style={{ fontSize: "0.8rem", color: "#666" }}>
                    {marker.date}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="ثبت اطلاعات درخت"
        className="modal"
        overlayClassName="overlay"
      >
        <h2>اطلاعات درخت را وارد کنید</h2>
        <form onSubmit={handleSubmit}>
          <label>
            تعداد درخت‌ها:
            <input
              type="number"
              value={formData.trees}
              onChange={(e) => setFormData({ ...formData, trees: e.target.value })}
              required
            />
          </label>
          <label>
            توضیحات:
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </label>
          <div className="form-buttons">
            <button type="submit">ثبت</button>
            <button type="button" onClick={() => setModalIsOpen(false)}>
              انصراف
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default App;
