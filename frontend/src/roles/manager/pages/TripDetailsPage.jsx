import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  ArrowLeft,
  Route,
  ChevronDown,
  Clock,
  Calendar,
  Truck,
  User,
  MapPin,
  Compass,
  AlertCircle,
  CheckCircle2,
  Phone,
  Mail,
  X,
  AlertTriangle,
  Eye,
  DollarSign,
  Activity,
  Wallet,
  TrendingUp,
  Percent,
  FileText,
  MessageSquare
} from "lucide-react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/common/Breadcrumb";
import { formatEmployeeId } from "@/utils/employeeIdFormatter";
import DriverChatDrawer from "@/components/common/DriverChatDrawer";
import { getSocket } from "@/api/socket";
import { useAuth } from "@/context/AuthContext";

import { managerApi } from "../api/managerApi";
import { calculateDrivingRoute, calculateFallbackDistance } from "../services/routingService";

export default function TripDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, user } = useAuth();
  const [trip, setTrip] = useState(null);

  const [activeTab, setActiveTab] = useState(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["overview", "timeline", "documents"].includes(tabParam.toLowerCase())) {
      return tabParam.toLowerCase();
    }
    return "overview";
  });

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["overview", "timeline", "documents"].includes(tabParam.toLowerCase())) {
      setActiveTab(tabParam.toLowerCase());
    } else {
      setActiveTab("overview");
    }
  }, [searchParams, id]);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [invoice, setInvoice] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [pod, setPod] = useState(null);
  const [showPodModal, setShowPodModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  const [weighbridge, setWeighbridge] = useState(null);
  const [showWeighbridgeModal, setShowWeighbridgeModal] = useState(false);
  const [weighbridgeRejectReason, setWeighbridgeRejectReason] = useState("");
  const [showWeighbridgeRejectModal, setShowWeighbridgeRejectModal] = useState(false);

  const [tolls, setTolls] = useState([]);
  const [isTollOpen, setIsTollOpen] = useState(false);
  const [loadingTolls, setLoadingTolls] = useState(false);
  const [selectedTollReceipt, setSelectedTollReceipt] = useState(null);
  const [toll, setToll] = useState(null);
  const [showTollModal, setShowTollModal] = useState(false);
  const [tollRejectReason, setTollRejectReason] = useState("");
  const [showTollRejectModal, setShowTollRejectModal] = useState(false);

  const tollDropdownRef = useRef(null);
  const tollButtonRef = useRef(null);

  const invoiceModalOverlayRef = useRef(null);
  const invoiceModalContentRef = useRef(null);

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  const [drivingInfo, setDrivingInfo] = useState(null);

  // Reset Trip Invoice scroll position to top whenever modal opens
  useEffect(() => {
    if (showInvoiceModal && invoice) {
      console.log("=====================================");
      console.log("Opening Trip Invoice...");
      console.log("Resetting Invoice Scroll Position...");

      // Reset main window scroll position
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });

      // Reset modal container scroll positions
      if (invoiceModalOverlayRef.current) {
        invoiceModalOverlayRef.current.scrollTop = 0;
      }
      if (invoiceModalContentRef.current) {
        invoiceModalContentRef.current.scrollTop = 0;
      }

      console.log("Scroll Position: Top");
      console.log("Invoice Ready");
      console.log("=====================================");
    }
  }, [showInvoiceModal, invoice]);

  // Initialize Leaflet map
  useEffect(() => {
    if (!trip || activeTab !== "overview") return;

    let isMounted = true;
    let map = null;

    // Small delay to ensure DOM node mapRef.current is rendered
    const timer = setTimeout(async () => {
      if (!mapRef.current || !isMounted) return;

      // Clear old map instance if exists
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      let res = { success: false };
      try {
        res = await calculateDrivingRoute(trip.startLocation, trip.endLocation);
      } catch (err) {
        console.error("Failed to calculate driving route for map:", err);
      }

      if (!isMounted || !mapRef.current) return;

      if (res && res.success) {
        setDrivingInfo(res);
      }

      const startCoords = res.startCoords || [14.6819, 77.6006];
      const endCoords = res.endCoords || [24.8170, 93.9368];
      const pathCoords = (res.routeGeometry && res.routeGeometry.length > 0)
        ? res.routeGeometry
        : [startCoords, endCoords];

      // Initialize Leaflet map instance
      map = L.map(mapRef.current);
      map.setView(startCoords, 8);

      // Add OpenStreetMap tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      // Start Location Marker
      const startIcon = L.divIcon({
        html: `<div class="bg-[#B45A0A] rounded-full w-6 h-6 flex items-center justify-center text-white shadow-lg border-2 border-white animate-pulse">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>`,
        className: "",
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      // Destination Marker
      const endIcon = L.divIcon({
        html: `<div class="bg-indigo-600 rounded-full w-6 h-6 flex items-center justify-center text-white shadow-lg border-2 border-white animate-pulse">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>`,
        className: "",
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      L.marker(startCoords, { icon: startIcon }).bindPopup(`<strong>Start Location</strong><br/>${trip.startLocation}`).addTo(map);
      L.marker(endCoords, { icon: endIcon }).bindPopup(`<strong>Destination</strong><br/>${trip.endLocation}`).addTo(map);

      // Road Polyline connecting locations
      const polyline = L.polyline(pathCoords, {
        color: '#B45A0A',
        weight: 4,
        dashArray: '6, 8',
        opacity: 0.8
      }).addTo(map);

      map.fitBounds(polyline.getBounds(), { padding: [50, 50] });

      mapInstanceRef.current = map;

      // Invalidate size to ensure Leaflet renders tiles inside flex/tab containers
      setTimeout(() => {
        if (map) map.invalidateSize();
      }, 200);
    }, 100);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [trip, activeTab]);

  // Load trip record & invoice
  const fetchTripAndInvoice = async () => {
    try {
      const response = await managerApi.getTripById(id);
      const data = response.data?.data || response.data;
      if (data) {
        setTrip({ ...data, id: data.tripNumber });
        
        // Fetch invoice, POD, and weighbridge in parallel with error handling
        Promise.allSettled([
          (async () => {
            try {
              const invRes = await managerApi.getInvoiceByTripId(data._id);
              const invData = invRes.data?.data || invRes.data;
              if (invData) setInvoice(invData);
            } catch (invErr) {
              console.debug("Invoice not available for this trip");
            }
          })(),
          (async () => {
            try {
              const podRes = await managerApi.getPODByTripId(data._id);
              const podData = podRes.data?.data || podRes.data;
              if (podData) setPod(podData);
            } catch (podErr) {
              console.debug("POD not available for this trip");
            }
          })(),
          (async () => {
            try {
              const wbRes = await managerApi.getWeighbridgeSlipByTripId(data._id);
              const wbData = wbRes.data?.data || wbRes.data;
              if (wbData) setWeighbridge(wbData);
            } catch (wbErr) {
              console.debug("Weighbridge slip not available for this trip");
            }
          })()
        ]).catch(err => {
          console.debug("Error loading trip documents:", err);
        });

        // Fetch tolls
        const generateFrontendMockTolls = (tripObj) => {
          const plazas = [
            { name: 'Khalapur Toll Plaza', location: 'Mumbai-Pune Expressway' },
            { name: 'Electronic City Toll Plaza', location: 'Bengaluru, KA' },
            { name: 'Lalru Toll Plaza', location: 'Ambala-Chandigarh Highway' },
            { name: 'Vasad Toll Plaza', location: 'Vadodara-Ahmedabad NH-8' },
            { name: 'Kherki Daula Toll Plaza', location: 'Gurugram, HR' },
            { name: 'Chennai Bypass Toll', location: 'Chennai, TN' },
            { name: 'NICE Road Plaza', location: 'Bengaluru, KA' }
          ];

          const numTolls = 3;
          const tripDate = new Date(tripObj.departureTime || Date.now());
          const mockList = [];

          for (let i = 0; i < numTolls; i++) {
            const plaza = plazas[(i + 2) % plazas.length];
            const amount = [120, 230, 310][i];
            const hoursOffset = 1.5 + (i * 2.5);
            const dateTime = new Date(tripDate.getTime() + hoursOffset * 3600 * 1000); 
            const txId = 'FT' + (984210000000 + i * 1421);

            mockList.push({
              _id: `mock-toll-${tripObj._id || '123'}-${i}`,
              trip: tripObj._id || '123',
              vehiclePlate: tripObj.vehiclePlate || 'MH-12-PQ-4567',
              tollPlazaName: plaza.name,
              location: plaza.location,
              dateTime: dateTime.toISOString(),
              amountPaid: amount,
              paymentMethod: 'FASTag',
              fastagTransactionId: txId,
              receiptStatus: 'Settled',
              receiptUrl: ''
            });
          }
          return mockList;
        };

        try {
          setLoadingTolls(true);
          const tollsRes = await managerApi.getTollsByTripId(data._id);
          const tollsData = tollsRes.data?.data || tollsRes.data;
          if (tollsData && tollsData.length > 0) {
            setTolls(tollsData);
          } else {
            setTolls(generateFrontendMockTolls(data));
          }
        } catch (tollsErr) {
          console.debug("Tolls data unavailable, using mock data");
          setTolls(generateFrontendMockTolls(data));
        } finally {
          setLoadingTolls(false);
        }
      }
    } catch (error) {
      toast.error("Failed to load trip details");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchTripAndInvoice();
  }, [id]);

  // Listen for real-time POD uploads from driver
  useEffect(() => {
    if (user?.role === "manager" && trip) {
      const socket = getSocket();
      socket.emit("joinManagerRoom", user._id || user.id);

      // Listen for pod upload event
      const handlePodUploaded = (newPod) => {
        // Only update if it's for the current trip
        if (String(newPod.trip) === String(trip._id) || String(newPod.trip) === String(trip.id)) {
          setPod(newPod);
          toast.success("Driver uploaded Proof of Delivery!");
        }
      };

      // Listen for weighbridge upload event
      const handleWeighbridgeUploaded = (data) => {
        if (String(data.tripId) === String(trip._id) || String(data.tripId) === String(trip.id)) {
          setWeighbridge(data.slip);
          toast.success("Driver uploaded Weighbridge Slip!");
        }
      };

      socket.on("pod:uploaded", handlePodUploaded);
      socket.on("weighbridge:uploaded", handleWeighbridgeUploaded);
      
      const handleTripStatusUpdated = (updatedTrip) => {
        if (String(updatedTrip._id) === String(trip._id) || String(updatedTrip.id) === String(trip.id)) {
          fetchTripAndInvoice();
          toast.success(`Trip status updated: ${updatedTrip.status}`);
        }
      };
      socket.on("trip:status-updated", handleTripStatusUpdated);

      return () => {
        socket.off("pod:uploaded", handlePodUploaded);
        socket.off("weighbridge:uploaded", handleWeighbridgeUploaded);
        socket.off("trip:status-updated", handleTripStatusUpdated);
      };
    }
  }, [user, trip]);
  // Handle click outside to close the toll details dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        isTollOpen && 
        tollDropdownRef.current && 
        !tollDropdownRef.current.contains(event.target) &&
        tollButtonRef.current && 
        !tollButtonRef.current.contains(event.target)
      ) {
        setIsTollOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isTollOpen]);



  const getFormattedInvoiceAddress = (addrObj, defaultLocString = '') => {
    const cleanLocation = (defaultLocString || '')
      .replace(/\(?-?\d+\.\d+,\s*-?\d+\.\d+\)?/g, '')
      .replace(/^\s*,\s*|\s*,\s*$/g, '')
      .trim();

    const parts = cleanLocation ? cleanLocation.split(',').map(s => s.trim()).filter(Boolean) : [];
    const fallbackCity = parts[0] || 'N/A';
    const fallbackState = parts.length > 1 ? parts[1] : (parts[0] || 'N/A');

    const companyName = addrObj?.companyName || (cleanLocation ? `${cleanLocation} Logistics Hub` : 'N/A');
    const contactPerson = addrObj?.contactPerson || 'N/A';
    const rawMobile = addrObj?.mobile || addrObj?.mobileNumber || '';
    const mobile = rawMobile ? (rawMobile.startsWith('+91') ? rawMobile : `+91 ${rawMobile}`) : 'N/A';
    const streetAddress = addrObj?.streetAddress || 'N/A';
    const area = addrObj?.area || addrObj?.areaLocality || '';
    const city = addrObj?.city || fallbackCity;
    const state = addrObj?.state || fallbackState;
    const pincode = addrObj?.pincode || '';

    return {
      companyName: companyName || 'N/A',
      contactPerson: contactPerson || 'N/A',
      mobile: mobile || 'N/A',
      streetAddress: streetAddress || 'N/A',
      area: area || '',
      city: city || 'N/A',
      state: state || 'N/A',
      pincode: pincode || ''
    };
  };

  const handlePrintInvoice = () => {
    if (!invoice) return;
    const fromAddr = getFormattedInvoiceAddress(trip.pickupAddress || trip.fromAddress, trip.startLocation);
    const toAddr = getFormattedInvoiceAddress(trip.deliveryAddress || trip.toAddress, trip.endLocation);

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice ${invoice.invoiceNumber}</title>
          <style>
            body { font-family: 'Nunito', sans-serif; color: #1E293B; padding: 40px; margin: 0; }
            .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #E7EAF0; border-radius: 12px; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #E7EAF0; padding-bottom: 20px; margin-bottom: 30px; }
            .logo-section { display: flex; align-items: center; gap: 10px; }
            .logo-icon { width: 32px; height: 32px; background: #B45A0A; border-radius: 8px; }
            .logo-text { font-family: 'Poppins', sans-serif; font-weight: bold; font-size: 20px; color: #1E293B; }
            .company-details { text-align: right; font-size: 11px; color: #64748B; line-height: 1.5; }
            .details-grid { display: grid; grid-cols: 2; gap: 20px; margin-bottom: 30px; }
            .details-col { font-size: 12px; }
            .section-title { font-family: 'Poppins', sans-serif; font-size: 13px; font-weight: bold; color: #64748B; text-transform: uppercase; border-bottom: 1px solid #E7EAF0; padding-bottom: 6px; margin-bottom: 12px; margin-top: 24px; }
            .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; font-size: 12px; }
            .info-item { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px dashed #F1F5F9; }
            .info-label { color: #64748B; }
            .info-val { font-weight: bold; color: #1E293B; }
            .address-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-top: 20px; }
            .address-box { background: #F8FAFC; border: 1px solid #E7EAF0; border-radius: 8px; padding: 16px; font-size: 12px; line-height: 1.6; }
            .address-title { font-family: 'Poppins', sans-serif; font-size: 11px; font-weight: bold; color: #B45A0A; text-transform: uppercase; border-bottom: 1px solid #E7EAF0; padding-bottom: 6px; margin-bottom: 10px; }
            .field-label { color: #64748B; font-size: 10px; font-weight: bold; text-transform: uppercase; margin-top: 6px; }
            .field-val { font-weight: bold; color: #1E293B; margin-bottom: 4px; }
            .footer { margin-top: 40px; border-top: 1px solid #E7EAF0; padding-top: 20px; font-size: 11px; color: #64748B; text-align: center; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="invoice-box">
            <div class="header">
              <div class="logo-section">
                <div class="logo-icon"></div>
                <div class="logo-text">Speshway Fleet</div>
              </div>
              <div class="company-details">
                <strong>Speshway Logistics Pvt Ltd</strong><br/>
                Plot 45, Industrial Depot, Sector 3<br/>
                Pune, Maharashtra, 411018<br/>
                Phone: +91 20 5566 7788<br/>
                Email: billing@speshway.com
              </div>
            </div>
            
            <div class="info-grid">
              <div class="info-item"><span class="info-label">Invoice Number</span><span class="info-val">${invoice.invoiceNumber}</span></div>
              <div class="info-item"><span class="info-label">Invoice Date</span><span class="info-val">${new Date(invoice.invoiceDate).toLocaleDateString("en-IN")}</span></div>
              <div class="info-item"><span class="info-label">Trip ID</span><span class="info-val">${trip.tripNumber}</span></div>
              <div class="info-item"><span class="info-label">Trip Status</span><span class="info-val">${trip.status === "Completed" ? "Complete" : trip.status}</span></div>
            </div>

            <div class="section-title">Trip Information</div>
            <div class="info-grid">
              <div class="info-item"><span class="info-label">Departure Date & Time</span><span class="info-val">${formatDateTime(trip.departureTime)}</span></div>
              <div class="info-item"><span class="info-label">Estimated Arrival</span><span class="info-val">${formatDateTime(trip.eta)}</span></div>
              <div class="info-item"><span class="info-label">Distance (KM)</span><span class="info-val">${distanceVal} KM</span></div>
              <div class="info-item"><span class="info-label">Cargo Type</span><span class="info-val">${trip.cargoType || "General Cargo"}</span></div>
              <div class="info-item"><span class="info-label">Cargo Weight</span><span class="info-val">${trip.cargoWeight || 0} kg</span></div>
              <div class="info-item"><span class="info-label">Trip Notes</span><span class="info-val">${trip.tripNotes || "None"}</span></div>
            </div>

            <div class="address-grid">
              <div class="address-box">
                <div class="address-title">FROM ADDRESS</div>
                <div style="font-weight: bold; color: #1E293B; font-size: 14px; margin-bottom: 6px;">${fromAddr.companyName}</div>
                
                <div class="field-label">Contact Person</div>
                <div class="field-val">${fromAddr.contactPerson}</div>

                <div class="field-label">Mobile</div>
                <div class="field-val">${fromAddr.mobile}</div>

                <div style="margin-top: 6px; color: #334155;">
                  <div>${fromAddr.streetAddress}</div>
                  ${fromAddr.area ? `<div>${fromAddr.area}</div>` : ''}
                </div>

                <div style="color: #1E293B; font-weight: bold; margin-top: 6px; padding-top: 6px; border-top: 1px dashed #E2E8F0;">
                  <div>${fromAddr.city}</div>
                  <div>${fromAddr.state}${fromAddr.pincode ? ' - ' + fromAddr.pincode : ''}</div>
                </div>
              </div>

              <div class="address-box">
                <div class="address-title">TO ADDRESS</div>
                <div style="font-weight: bold; color: #1E293B; font-size: 14px; margin-bottom: 6px;">${toAddr.companyName}</div>
                
                <div class="field-label">Contact Person</div>
                <div class="field-val">${toAddr.contactPerson}</div>

                <div class="field-label">Mobile</div>
                <div class="field-val">${toAddr.mobile}</div>

                <div style="margin-top: 6px; color: #334155;">
                  <div>${toAddr.streetAddress}</div>
                  ${toAddr.area ? `<div>${toAddr.area}</div>` : ''}
                </div>

                <div style="color: #1E293B; font-weight: bold; margin-top: 6px; padding-top: 6px; border-top: 1px dashed #E2E8F0;">
                  <div>${toAddr.city}</div>
                  <div>${toAddr.state}${toAddr.pincode ? ' - ' + toAddr.pincode : ''}</div>
                </div>
              </div>
            </div>

            <div class="section-title">Vehicle Information</div>
            <div class="info-grid">
              <div class="info-item"><span class="info-label">Vehicle Name</span><span class="info-val">${trip.vehicleName || "N/A"}</span></div>
              <div class="info-item"><span class="info-label">Registration Number</span><span class="info-val">${trip.vehiclePlate || "N/A"}</span></div>
              <div class="info-item"><span class="info-label">Vehicle Type</span><span class="info-val">${trip.vehicle?.vehicleType || "Truck"}</span></div>
            </div>

            <div class="section-title">Driver Information</div>
            <div class="info-grid">
              <div class="info-item"><span class="info-label">Driver Name</span><span class="info-val">${trip.driverName || "N/A"}</span></div>
              <div class="info-item"><span class="info-label">Employee ID</span><span class="info-val">${formatEmployeeId(trip.driver?.employeeId)}</span></div>
              <div class="info-item"><span class="info-label">Mobile Number</span><span class="info-val">${trip.driverPhone || trip.driver?.phoneNumber || trip.driver?.phone || "N/A"}</span></div>
            </div>

            <div class="section-title">Additional Info</div>
            <div class="info-grid">
              <div class="info-item"><span class="info-label">Created By</span><span class="info-val">${invoice.createdBy?.fullName || "Manager"}</span></div>
              <div class="info-item"><span class="info-label">Created Date & Time</span><span class="info-val">${new Date(invoice.createdAt || invoice.invoiceDate).toLocaleString("en-IN")}</span></div>
            </div>

            <div class="footer">
              Thank you for using Speshway Fleet Management System. This is a computer generated document and does not require signature.
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadInvoice = () => {
    handlePrintInvoice();
    toast.success("Preparing PDF download via print options");
  };

  const handlePODApprove = async () => {
    try {
      const response = await managerApi.updatePODStatus(pod._id, { status: "Approved" });
      const updatedPod = response.data?.data || response.data;
      setPod(updatedPod);
      toast.success("POD Approved successfully");
      await fetchTripAndInvoice();
    } catch (error) {
      toast.error("Failed to approve POD");
    }
  };

  const handlePODReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    try {
      const response = await managerApi.updatePODStatus(pod._id, { status: "Rejected", rejectionReason: rejectReason });
      const updatedPod = response.data?.data || response.data;
      setPod(updatedPod);
      setShowRejectModal(false);
      setRejectReason("");
      toast.success("POD Rejected successfully");
      await fetchTripAndInvoice();
    } catch (error) {
      toast.error("Failed to reject POD");
    }
  };


  const handleWeighbridgeApprove = async () => {
    try {
      const response = await managerApi.updateWeighbridgeSlipStatus(weighbridge._id, { status: "Approved" });
      const updatedData = response.data?.data || response.data;
      setWeighbridge(updatedData);
      toast.success("Weighbridge Slip Approved");
      await fetchTripAndInvoice();
    } catch (error) {
      toast.error("Failed to approve Weighbridge Slip");
    }
  };

  const handleWeighbridgeReject = async () => {
    if (!weighbridgeRejectReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    try {
      const response = await managerApi.updateWeighbridgeSlipStatus(weighbridge._id, { status: "Rejected", rejectionReason: weighbridgeRejectReason });
      const updatedData = response.data?.data || response.data;
      setWeighbridge(updatedData);
      setShowWeighbridgeRejectModal(false);
      setWeighbridgeRejectReason("");
      toast.success("Weighbridge Slip Rejected");
    } catch (error) {
      toast.error("Failed to reject Weighbridge Slip");
    }
  };

  const handleTollApprove = async () => {
    try {
      const response = await managerApi.updateTollReceiptsStatus(toll._id, { status: "Approved" });
      const updatedData = response.data?.data || response.data;
      setToll(updatedData);
      toast.success("Toll Receipts Approved");
    } catch (error) {
      toast.error("Failed to approve Toll Receipts");
    }
  };

  const handleTollReject = async () => {
    if (!tollRejectReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    try {
      const response = await managerApi.updateTollReceiptsStatus(toll._id, { status: "Rejected", rejectionReason: tollRejectReason });
      const updatedData = response.data?.data || response.data;
      setToll(updatedData);
      setShowTollRejectModal(false);
      setTollRejectReason("");
      toast.success("Toll Receipts Rejected");
    } catch (error) {
      toast.error("Failed to reject Toll Receipts");
    }
  };

  if (!trip) {
    return (
      <div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center p-6 lg:p-8 font-poppins">
        <div className="flex flex-col items-center gap-3">
          <AlertCircle className="w-9 h-9 text-red-500 animate-bounce" />
          <p className="text-gray-500 font-semibold">Trip record not found</p>
          <button onClick={() => navigate("/manager/trips")} className="text-xs text-[#B45A0A] hover:underline font-bold font-poppins mt-2">
            Back to Trips
          </button>
        </div>
      </div>
    );
  }

  // Calculate mock metrics for details view
  const isTransit = trip.status === "On Transit";
  const isCompleted = trip.status === "Completed";
  const isDelayed = trip.status === "Delayed";

  const totalDistance = (drivingInfo?.distanceKm && drivingInfo.distanceKm < 4000)
    ? drivingInfo.distanceKm
    : ((trip.estimatedDistance && trip.estimatedDistance > 0 && trip.estimatedDistance < 4000)
      ? trip.estimatedDistance
      : calculateFallbackDistance(trip.startLocation, trip.endLocation));
  
  const distanceVal = trip.status === "Completed" 
    ? ((trip.actualDistance && trip.actualDistance > 0 && trip.actualDistance < 4000) ? trip.actualDistance : totalDistance)
    : totalDistance;

  const tripCargoWeight = trip.cargoWeight && trip.cargoWeight.toString().trim() ? Number(trip.cargoWeight) : null;
  const weightVal = tripCargoWeight !== null ? tripCargoWeight : 0;

  const tripRevenue = Math.round(distanceVal * 52 + weightVal * 4.5);
  const tripExpenses = Math.round(distanceVal * 19.5 + (weightVal > 1000 ? 1200 : 600) + 1000);
  const tripNet = tripRevenue - tripExpenses;
  const tripMargin = tripRevenue > 0 ? Math.round((tripNet / tripRevenue) * 100) : 0;
  const distanceTravelled = trip.status === "Scheduled" ? 0 : isCompleted ? totalDistance : Math.round(totalDistance * 0.56);
  const distancePercent = trip.status === "Scheduled" ? "0%" : isCompleted ? "100%" : "56%";

  const isWeighbridgeApproved = weighbridge && weighbridge.status === "Approved";
  const isPodApproved = pod && pod.status === "Approved";
  const canCompleteTrip = isWeighbridgeApproved && isPodApproved;

  const handleUpdateStatus = async (newStatus) => {
    try {
      const response = await managerApi.updateTrip(trip._id, { status: newStatus });
      const data = response.data?.data || response.data;
      setTrip({ ...data, id: data.tripNumber });
      if (newStatus === "Completed") {
        toast.success("Trip completed successfully. Fastag balance updated after deducting total toll charges.");
      } else {
        toast.success(`Trip status updated to ${newStatus}`);
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || "Failed to update status";
      toast.error(errMsg);
      console.error(error);
    }
  };

  const handleCancelTrip = async () => {
    try {
      await managerApi.deleteTrip(trip._id);
      setShowCancelConfirm(false);
      toast.success("Trip record cancelled and deleted");
      navigate("/manager/trips");
    } catch (error) {
      toast.error("Failed to cancel trip");
      console.error(error);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "On Transit":
        return "bg-[#FDF3EC] text-[#B45A0A] border border-[#FDF3EC]";
      case "Scheduled":
        return "bg-indigo-50 text-indigo-700 border border-indigo-100";
      case "Completed":
        return "bg-slate-900 text-white border border-slate-950";
      case "Delayed":
        return "bg-red-50 text-red-600 border border-red-100";
      default:
        return "bg-gray-100 text-gray-500";
    }
  };

  const formatDateTime = (dtString) => {
    if (!dtString) return "N/A";
    return new Date(dtString).toLocaleDateString("en-IN", {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const calculateDuration = (start, end) => {
    if (!start || !end) return "N/A";
    const startTime = new Date(start);
    const endTime = new Date(end);
    const diffMs = endTime - startTime;
    if (diffMs <= 0) return "0 hrs";
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours} hrs ${diffMins} mins`;
    }
    return `${diffMins} mins`;
  };



  return (
    <div className="p-6 lg:p-8 bg-[#F5F7FB] font-nunito text-[#1E293B] min-h-screen">
      <Breadcrumb />

      {/* Heading summary header card */}
      <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-poppins font-bold text-[32px] text-[#1E293B] leading-none">
              {trip.tripNumber}
            </h1>
            <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(trip.status)}`}>
              {trip.status === "Completed" ? "Complete" : trip.status}
            </span>
          </div>
          <p className="text-[14px] text-[#64748B] mt-[12px] font-medium">
            Route from <strong>{trip.startLocation}</strong> to <strong>{trip.endLocation}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          {trip.status === "Scheduled" || trip.status === "Assigned" ? (
            <button
              onClick={() => handleUpdateStatus("In Progress")}
              className="flex-1 md:flex-none px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-xs font-bold text-white transition-all shadow-md cursor-pointer text-center"
            >
              Start Trip
            </button>
          ) : trip.status === "In Progress" ? (
            <button
              onClick={() => handleUpdateStatus("Completed")}
              disabled={!canCompleteTrip}
              className={`flex-1 md:flex-none px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-md text-center ${
                canCompleteTrip
                  ? "bg-[#B45A0A] hover:bg-[#9A4D08] cursor-pointer"
                  : "bg-gray-400 cursor-not-allowed opacity-60"
              }`}
              title={
                !canCompleteTrip
                  ? (!isWeighbridgeApproved && !isPodApproved)
                    ? "Trip cannot be completed. Please approve both the Weighbridge and Proof of Delivery documents first."
                    : !isWeighbridgeApproved
                    ? "Trip cannot be completed. Please approve the Weighbridge document first."
                    : "Trip cannot be completed. Please approve the Proof of Delivery document first."
                  : ""
              }
            >
              Complete Trip
            </button>
          ) : null}

          {(trip.status === "Scheduled" || trip.status === "Assigned") && (
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="flex-1 md:flex-none px-5 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-bold transition-all border border-red-100 cursor-pointer text-center"
            >
              Cancel Dispatch
            </button>
          )}
        </div>
      </div>

      {/* Top Tab Navigation Bar */}
      <div className="bg-white rounded-2xl border border-[#E7EAF0] p-1.5 shadow-sm mt-6 flex items-center gap-1.5 font-poppins text-xs font-bold overflow-x-auto no-scrollbar">
        {[
          { id: "overview", label: "Overview", icon: Route },
          { id: "timeline", label: "Timeline", icon: Clock },
          { id: "documents", label: "Documents", icon: FileText }
        ].map((tabItem) => {
          const Icon = tabItem.icon;
          const isActive = activeTab === tabItem.id;
          return (
            <button
              key={tabItem.id}
              onClick={() => {
                setActiveTab(tabItem.id);
                setSearchParams({ tab: tabItem.id });
              }}
              className={`px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                isActive
                  ? "bg-[#B45A0A] text-white shadow-md shadow-[#B45A0A]/20"
                  : "text-[#64748B] hover:text-[#1E293B] hover:bg-slate-50"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tabItem.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview View */}
      {activeTab === "overview" && (
        <div className="space-y-6 mt-6">
          {/* KPI statistics cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        
        {/* Distance Stats */}
        <div className="bg-white rounded-xl border border-[#E7EAF0] p-5 shadow-sm space-y-3">
          <p className="text-[10px] font-black text-[#64748B] uppercase tracking-wider font-poppins">Distance Details</p>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-3xl font-black text-[#1E293B] font-poppins">
              {distanceVal}
            </span>
            <span className="text-xs text-[#64748B] font-bold">KM</span>
          </div>
          <div className="text-[10px] text-gray-500 font-semibold">
            {trip.status === "Completed" ? (
              <span>Actual distance logged upon completion</span>
            ) : (
              <span>Estimated route distance: {distanceVal} KM</span>
            )}
          </div>
        </div>

        {/* Departure Time */}
        <div className="bg-white rounded-xl border border-[#E7EAF0] p-5 shadow-sm space-y-3">
          <p className="text-[10px] font-black text-[#64748B] uppercase tracking-wider font-poppins">Planned Departure</p>
          <p className="text-sm font-bold text-[#1E293B] mt-2 font-poppins">
            {formatDateTime(trip.departureTime)}
          </p>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-500">
            <Calendar className="w-3.5 h-3.5" />
            Scheduled departure time
          </span>
        </div>

        {/* Expected Arrival */}
        <div className="bg-white rounded-xl border border-[#E7EAF0] p-5 shadow-sm space-y-3">
          <p className="text-[10px] font-black text-[#64748B] uppercase tracking-wider font-poppins">Estimated Arrival (ETA)</p>
          <p className="text-sm font-bold text-[#1E293B] mt-2 font-poppins">
            {formatDateTime(trip.eta)}
          </p>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-500">
            <Clock className="w-3.5 h-3.5" />
            Expected delivery schedule
          </span>
        </div>

      </div>

      {/* Form details / Map grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        
        {/* Left Column: Live Map & Cargo Specifications */}
        <div className="lg:col-span-8 space-y-6">
          {/* Live transit tracking */}
          <div className="bg-white rounded-2xl border border-[#E7EAF0] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-poppins font-bold text-[#1E293B] text-[14px]">Live Transit Tracking</h3>
              <span className="px-2.5 py-1 bg-emerald-50 text-[#22C55E] border border-emerald-100 rounded-lg text-[9px] font-bold flex items-center gap-1 select-none font-poppins">
                <Compass className="w-3 h-3 animate-spin" />
                GPS Connection Active
              </span>
            </div>

            {/* Leaflet map node container */}
            <div className="relative h-[360px] border border-[#DCE2E6] rounded-xl overflow-hidden shadow-inner">
              <div ref={mapRef} className="w-full h-full z-0" />
              
              {/* Floating Route indicators */}
              <div className="absolute bottom-3 left-3 z-[1000] flex flex-col gap-2 max-w-[220px] bg-white/95 backdrop-blur-sm border border-[#E7EAF0] p-3.5 rounded-xl shadow-lg font-poppins text-[10px] text-[#1E293B]">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#B45A0A]"></div>
                  <span><strong>Start:</strong> {trip.startLocation}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-600"></div>
                  <span><strong>Target:</strong> {trip.endLocation}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cargo Details Card */}
          <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-sm space-y-4">
            <h3 className="font-poppins font-bold text-[#1E293B] text-[14px] border-b border-gray-100 pb-3">Cargo & Dispatch Specifications</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider font-poppins">Cargo Type</span>
                <p className="text-sm font-bold text-[#1E293B]">{trip.cargoType || "Not Specified"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider font-poppins">Cargo Weight</span>
                <p className="text-sm font-bold text-[#1E293B]">{trip.cargoWeight ? `${trip.cargoWeight} kg` : "N/A"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider font-poppins">Cargo Description</span>
                <p className="text-sm font-semibold text-[#1E293B]">{trip.description || "No description provided"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider font-poppins">Trip Notes</span>
                <p className="text-sm font-medium text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100">{trip.tripNotes || "No notes available for this dispatch"}</p>
              </div>
            </div>
          </div>

          {/* Pickup Address & Delivery Address Details Card */}
          <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-sm space-y-4 font-nunito">
            <h3 className="font-poppins font-bold text-[#1E293B] text-[14px] border-b border-gray-100 pb-3 flex items-center justify-between">
              <span>Pickup & Delivery Address Details</span>
              <span className="text-[10px] text-[#B45A0A] font-bold uppercase tracking-wider bg-amber-50 px-2.5 py-1 rounded-md border border-amber-100">Logistics Addresses</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pickup Address (From Address) */}
              {(() => {
                const from = getFormattedInvoiceAddress(trip.pickupAddress || trip.fromAddress, trip.startLocation);
                return (
                  <div className="bg-slate-50/80 p-5 rounded-xl border border-slate-200/80 space-y-2.5 text-xs">
                    <h4 className="font-poppins font-bold text-[11px] text-[#B45A0A] uppercase tracking-wider border-b border-slate-200 pb-2">
                      FROM ADDRESS
                    </h4>
                    <div className="font-bold text-slate-800 text-sm">{from.companyName}</div>

                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contact Person</div>
                      <div className="font-bold text-slate-700 text-xs mt-0.5">{from.contactPerson}</div>
                    </div>

                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mobile</div>
                      <div className="font-bold text-slate-700 text-xs mt-0.5">{from.mobile}</div>
                    </div>

                    <div className="text-slate-700">
                      <div>{from.streetAddress}</div>
                      {from.area && <div>{from.area}</div>}
                    </div>

                    <div className="text-slate-800 font-bold pt-1.5 border-t border-slate-200/60">
                      <div>{from.city}</div>
                      <div>{from.state}{from.pincode ? ` - ${from.pincode}` : ''}</div>
                    </div>
                  </div>
                );
              })()}

              {/* Delivery Address (To Address) */}
              {(() => {
                const to = getFormattedInvoiceAddress(trip.deliveryAddress || trip.toAddress, trip.endLocation);
                return (
                  <div className="bg-slate-50/80 p-5 rounded-xl border border-slate-200/80 space-y-2.5 text-xs">
                    <h4 className="font-poppins font-bold text-[11px] text-[#B45A0A] uppercase tracking-wider border-b border-slate-200 pb-2">
                      TO ADDRESS
                    </h4>
                    <div className="font-bold text-slate-800 text-sm">{to.companyName}</div>

                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contact Person</div>
                      <div className="font-bold text-slate-700 text-xs mt-0.5">{to.contactPerson}</div>
                    </div>

                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mobile</div>
                      <div className="font-bold text-slate-700 text-xs mt-0.5">{to.mobile}</div>
                    </div>

                    <div className="text-slate-700">
                      <div>{to.streetAddress}</div>
                      {to.area && <div>{to.area}</div>}
                    </div>

                    <div className="text-slate-800 font-bold pt-1.5 border-t border-slate-200/60">
                      <div>{to.city}</div>
                      <div>{to.state}{to.pincode ? ` - ${to.pincode}` : ''}</div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Cost & Earnings Projection Card */}
          {trip.status === 'Completed' && (
            <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-sm space-y-4">
              <h3 className="font-poppins font-bold text-[#1E293B] text-[14px] border-b border-gray-150 pb-3">Financial Cost & Earnings Summary</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                    <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider font-poppins block">Distance</span>
                    <span className="text-lg font-black text-[#1E293B] font-poppins mt-1 block">{distanceVal} KM</span>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                    <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider font-poppins block">Cargo Weight</span>
                    <span className="text-lg font-black text-[#1E293B] font-poppins mt-1 block">{tripCargoWeight !== null ? `${tripCargoWeight} kg` : "--"}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {/* Revenue */}
                  <div className="p-3 bg-emerald-50/50 border border-emerald-100/50 rounded-xl">
                    <div className="flex items-center gap-1.5 text-emerald-600">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span className="text-[9px] font-bold uppercase tracking-wider font-poppins block">Revenue</span>
                    </div>
                    <span className="text-sm font-bold text-[#1E293B] font-poppins mt-1 block">₹{tripRevenue.toLocaleString('en-IN')}</span>
                  </div>

                  {/* Expenses */}
                  <div className="p-3 bg-red-50/50 border border-red-100/50 rounded-xl">
                    <div className="flex items-center gap-1.5 text-red-500">
                      <Activity className="w-3.5 h-3.5" />
                      <span className="text-[9px] font-bold uppercase tracking-wider font-poppins block">Costs</span>
                    </div>
                    <span className="text-sm font-bold text-[#1E293B] font-poppins mt-1 block">₹{tripExpenses.toLocaleString('en-IN')}</span>
                  </div>

                  {/* Net Profit */}
                  <div className="p-3 bg-amber-50/50 border border-[#FFF3E8] rounded-xl">
                    <div className="flex items-center gap-1.5 text-[#B45A0A]">
                      <Wallet className="w-3.5 h-3.5" />
                      <span className="text-[9px] font-bold uppercase tracking-wider font-poppins block">Net Earnings</span>
                    </div>
                    <span className="text-sm font-bold text-[#1E293B] font-poppins mt-1 block">₹{tripNet.toLocaleString('en-IN')}</span>
                  </div>

                  {/* Toll Details Button Card */}
                  <button
                    ref={tollButtonRef}
                    onClick={() => setIsTollOpen(!isTollOpen)}
                    className="p-3 bg-indigo-50/40 border border-indigo-100/50 rounded-xl hover:bg-indigo-50 transition-all text-left flex flex-col justify-between h-full group focus:outline-none cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full text-indigo-600">
                      <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider font-poppins">
                        <Route className="w-3.5 h-3.5 group-hover:animate-pulse" />
                        <span className="text-[9px] font-bold">Toll Details</span>
                      </div>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isTollOpen ? 'rotate-180' : ''}`} />
                    </div>
                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className="text-sm font-bold text-[#1E293B] font-poppins">
                        {loadingTolls ? '...' : `₹${tolls.reduce((sum, t) => sum + t.amountPaid, 0).toLocaleString('en-IN')}`}
                      </span>
                      <span className="text-[8px] text-[#64748B] font-bold">
                        ({tolls.length} Plazas)
                      </span>
                    </div>
                  </button>
                </div>

                {/* Toll Details Dropdown Panel (Inline) */}
                <div
                  ref={tollDropdownRef}
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isTollOpen ? 'max-h-[1200px] opacity-100 mt-3 mb-1' : 'max-h-0 opacity-0 pointer-events-none'
                  }`}
                >
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4.5 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600">
                          <Route className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <h4 className="font-poppins font-bold text-[#1E293B] text-[12px]">FASTag Toll Log</h4>
                          <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider">Dynamic Transit Ledger</p>
                        </div>
                      </div>
                      <div className="flex gap-4 text-[11px] font-nunito font-semibold text-[#64748B]">
                        <div>
                          Plazas Crossed: <span className="text-[#1E293B] font-bold">{tolls.length}</span>
                        </div>
                        <div className="border-l border-slate-200 pl-4">
                          Total Paid: <span className="text-indigo-600 font-extrabold">₹{tolls.reduce((sum, t) => sum + t.amountPaid, 0).toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>

                    {loadingTolls ? (
                      <div className="py-6 text-center text-gray-400 font-medium font-nunito">Loading toll transactions...</div>
                    ) : tolls.length === 0 ? (
                      <div className="py-6 text-center text-gray-400 font-medium text-xs font-poppins">
                        No FASTag toll transactions available for this trip.
                      </div>
                    ) : (
                      <div className="overflow-x-auto no-scrollbar">
                        <table className="w-full text-left border-collapse text-xs font-nunito">
                          <thead>
                            <tr className="bg-white/80 border-b border-slate-200/50 text-[#64748B] font-poppins font-semibold uppercase text-[9px] tracking-wider select-none whitespace-nowrap">
                              <th className="py-3 px-3.5 rounded-l-lg">Toll Plaza Name</th>
                              <th className="py-3 px-3.5">Date & Time</th>
                              <th className="py-3 px-3.5 text-right rounded-r-lg">Amount Charged</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200/30">
                            {tolls.map((t) => (
                              <tr key={t._id} className="hover:bg-white/40 transition-colors">
                                <td className="py-3 px-3.5 font-bold text-gray-800 whitespace-nowrap">{t.tollPlazaName}</td>
                                <td className="py-3 px-3.5 text-gray-500 whitespace-nowrap">
                                  {new Date(t.dateTime).toLocaleString('en-IN', {
                                    dateStyle: 'medium',
                                    timeStyle: 'short'
                                  })}
                                </td>
                                <td className="py-3 px-3.5 font-bold text-indigo-650 text-right whitespace-nowrap">₹{t.amountPaid}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100/70 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-white rounded-lg shadow-sm border border-orange-100 text-[#B45A0A]">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[9px] text-[#64748B] font-bold uppercase tracking-wider block">Projected Profit Margin</span>
                      <span className="text-xs text-[#B45A0A] font-black font-poppins">{tripMargin}% efficiency index</span>
                    </div>
                  </div>
                  <span className="text-lg font-black text-[#B45A0A] font-poppins">{tripMargin}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Checkpoints Route Timeline */}
          <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-sm space-y-4">
            <h3 className="font-poppins font-bold text-[#1E293B] text-[14px]">Route Timeline Logs</h3>
            
            <div className="relative pl-6 border-l-2 border-dashed border-gray-200 ml-3 space-y-6 pt-2">
              <div className="relative">
                <div className="absolute -left-[31px] top-0 w-4.5 h-4.5 bg-[#B45A0A] rounded-full border-4 border-orange-100 z-10"></div>
                <div>
                  <p className="text-xs font-bold text-[#1E293B] font-poppins">Dispatch Initialized</p>
                  <span className="text-[10px] text-gray-400 font-semibold block mt-0.5">
                    Planned Departure: {formatDateTime(trip.departureTime)}
                  </span>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-[31px] top-0 w-4.5 h-4.5 bg-emerald-500 rounded-full border-4 border-emerald-100 z-10"></div>
                <div>
                  <p className="text-xs font-bold text-[#1E293B] font-poppins">Actual Start</p>
                  <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">
                    {trip.actualStartTime ? `Started at: ${formatDateTime(trip.actualStartTime)}` : "Waiting to start..."}
                  </span>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-[31px] top-0 w-4.5 h-4.5 bg-indigo-600 rounded-full border-4 border-indigo-100 z-10"></div>
                <div>
                  <p className="text-xs font-bold text-[#1E293B] font-poppins">Actual End</p>
                  <span className="text-[10px] text-indigo-600 font-bold block mt-0.5">
                    {trip.actualEndTime ? `Completed at: ${formatDateTime(trip.actualEndTime)}` : "Waiting for completion..."}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Driver and Vehicle Details */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Dispatch Status Progress Timeline */}
          <div className="bg-white rounded-2xl border border-[#E7EAF0] p-5 shadow-sm space-y-4">
            <h4 className="font-poppins font-bold text-xs text-[#64748B] uppercase tracking-wider">Dispatch Progress</h4>
            
            <div className="space-y-4.5">
              {[
                { label: "Scheduled", desc: "Trip is scheduled in the calendar", done: true },
                { label: "Assigned", desc: "Driver & vehicle allocated", done: trip.status !== "Scheduled" },
                { label: "In Progress", desc: "Transit active on route", done: trip.status === "In Progress" || trip.status === "Completed" },
                { label: "Completed", desc: "Arrived at destination points", done: trip.status === "Completed" }
              ].map((step, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center border text-[9px] font-bold ${
                    step.done
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-gray-400 border-gray-200"
                  }`}>
                    {idx + 1}
                  </div>
                  <div>
                    <p className={`text-xs font-bold font-poppins ${step.done ? "text-[#1E293B]" : "text-gray-400"}`}>
                      {step.label}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Assigned Driver Profile Card */}
          <div className="bg-white rounded-2xl border border-[#E7EAF0] p-5 shadow-sm space-y-4">
            <h4 className="font-poppins font-bold text-xs text-[#64748B] uppercase tracking-wider">Assigned Driver</h4>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 text-[#B45A0A] rounded-xl flex items-center justify-center shrink-0 font-poppins font-black text-base border border-orange-200">
                {trip.driverName ? trip.driverName.split(" ").map(n => n[0]).join("").toUpperCase() : "DR"}
              </div>
              <div>
                <h5 className="font-poppins font-bold text-[#1E293B] text-sm">{trip.driverName || "Unassigned"}</h5>
                <span className="text-[10px] text-gray-500 font-bold block mt-0.5">
                  ID: {trip.driver?._id || "N/A"}
                </span>
              </div>
            </div>

            <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">License Number</span>
                <span className="font-bold text-gray-700">{trip.driver?.licenseNumber || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">License Expiry</span>
                <span className="font-bold text-gray-700">
                  {trip.driver?.licenseExpiry ? new Date(trip.driver.licenseExpiry).toLocaleDateString("en-IN") : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Driver Status</span>
                <span className={`font-bold px-1.5 py-0.5 rounded text-[9px] uppercase ${
                  trip.driver?.driverStatus === "AVAILABLE"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700"
                }`}>
                  {trip.driver?.driverStatus || "N/A"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <a
                href={`tel:${trip.driverPhone}`}
                className="px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-[#E7EAF0] rounded-xl text-[10px] font-bold text-[#64748B] hover:text-[#1E293B] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5" />
                Call Driver
              </a>
              <button
                onClick={() => setIsChatOpen(true)}
                className="px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-[#E7EAF0] rounded-xl text-[10px] font-bold text-[#64748B] hover:text-[#1E293B] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" />
                Message
              </button>
            </div>
          </div>

          {/* Vehicle Details Card */}
          <div className="bg-white rounded-2xl border border-[#E7EAF0] p-5 shadow-sm space-y-4">
            <h4 className="font-poppins font-bold text-xs text-[#64748B] uppercase tracking-wider">Vehicle Details</h4>
            
            <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
              {trip.vehicle?.vehicleImage?.secure_url || trip.vehicle?.image ? (
                <img
                  src={trip.vehicle?.vehicleImage?.secure_url || trip.vehicle?.image}
                  alt={trip.vehicleName}
                  className="w-12 h-12 rounded-xl object-cover border border-gray-200 shadow-sm shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-[#FDF3EC] border border-[#B45A0A]/20 flex items-center justify-center shrink-0">
                  <Truck className="w-6 h-6 text-[#B45A0A]" />
                </div>
              )}
              <div>
                <h5 className="font-poppins font-bold text-[#1E293B] text-sm">{trip.vehicleName || "Unassigned"}</h5>
                <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider block mt-0.5">
                  {trip.vehiclePlate || "N/A"}
                </span>
              </div>
            </div>

            <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#64748B] font-medium font-poppins">Model</span>
                <span className="font-bold text-[#1E293B]">{trip.vehicleName || "N/A"}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#64748B] font-medium font-poppins">Plate Number</span>
                <span className="font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-poppins uppercase text-[10px] tracking-wide border border-indigo-100">
                  {trip.vehiclePlate || "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#64748B] font-medium font-poppins">Vehicle Status</span>
                <span className={`font-bold px-1.5 py-0.5 rounded text-[9px] uppercase ${
                  trip.vehicle?.currentStatus === "Available"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-indigo-50 text-indigo-700"
                }`}>
                  {trip.vehicle?.currentStatus || "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#64748B] font-medium font-poppins">Fuel Type</span>
                <span className="font-bold text-gray-700 font-poppins">{trip.vehicle?.fuelType || "Diesel"}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#64748B] font-medium font-poppins">FASTag Balance</span>
                <span className={`font-bold font-poppins ${
                  (trip.vehicle?.fastagBalance ?? 0) < 1000 ? 'text-rose-600' : 'text-emerald-600'
                }`}>
                  ₹{trip.vehicle?.fastagBalance?.toLocaleString("en-IN") ?? 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )}

      {/* Tab 2: Timeline View */}
      {activeTab === "timeline" && (
        <div className="space-y-6 mt-6 max-w-4xl">
          {/* Dispatch Status Progress Timeline */}
          <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-sm space-y-4">
            <h4 className="font-poppins font-bold text-[#1E293B] text-sm uppercase tracking-wider">Dispatch Progress Milestones</h4>
            
            <div className="space-y-4.5 pt-2">
              {[
                { label: "Scheduled", desc: "Trip is scheduled in the calendar", done: true },
                { label: "Assigned", desc: "Driver & vehicle allocated", done: trip.status !== "Scheduled" },
                { label: "In Progress", desc: "Transit active on route", done: trip.status === "In Progress" || trip.status === "Completed" },
                { label: "Completed", desc: "Arrived at destination points", done: trip.status === "Completed" }
              ].map((step, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center border text-xs font-bold font-poppins ${
                    step.done
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-gray-400 border-gray-200"
                  }`}>
                    {idx + 1}
                  </div>
                  <div>
                    <p className={`text-sm font-bold font-poppins ${step.done ? "text-[#1E293B]" : "text-gray-400"}`}>
                      {step.label}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Checkpoints Route Timeline */}
          <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-sm space-y-4">
            <h3 className="font-poppins font-bold text-[#1E293B] text-sm uppercase tracking-wider">Route Checkpoints & Activity Logs</h3>
            
            <div className="relative pl-6 border-l-2 border-dashed border-gray-200 ml-3 space-y-6 pt-2">
              <div className="relative">
                <div className="absolute -left-[31px] top-0 w-4.5 h-4.5 bg-[#B45A0A] rounded-full border-4 border-orange-100 z-10"></div>
                <div>
                  <p className="text-xs font-bold text-[#1E293B] font-poppins">Dispatch Initialized</p>
                  <span className="text-[10px] text-gray-400 font-semibold block mt-0.5">
                    Planned Departure: {formatDateTime(trip.departureTime)}
                  </span>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-[31px] top-0 w-4.5 h-4.5 bg-emerald-500 rounded-full border-4 border-emerald-100 z-10"></div>
                <div>
                  <p className="text-xs font-bold text-[#1E293B] font-poppins">Actual Start</p>
                  <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">
                    {trip.actualStartTime ? `Started at: ${formatDateTime(trip.actualStartTime)}` : "Waiting to start..."}
                  </span>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-[31px] top-0 w-4.5 h-4.5 bg-indigo-600 rounded-full border-4 border-indigo-100 z-10"></div>
                <div>
                  <p className="text-xs font-bold text-[#1E293B] font-poppins">Actual End</p>
                  <span className="text-[10px] text-indigo-600 font-bold block mt-0.5">
                    {trip.actualEndTime ? `Completed at: ${formatDateTime(trip.actualEndTime)}` : "Waiting for completion..."}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Documents View */}
      {activeTab === "documents" && (
        <div className="space-y-6 mt-6 max-w-4xl">
          <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-sm space-y-6">
            <h4 className="font-poppins font-bold text-sm text-[#1E293B] uppercase tracking-wider border-b border-[#E7EAF0] pb-3">
              Trip Documents Ledger
            </h4>

            {/* Trip Invoice Section */}
            <div className="space-y-3">
              <h5 className="font-poppins font-bold text-xs text-[#1E293B]">Trip Invoice</h5>
              {!invoice ? (
                <p className="text-xs text-gray-500 font-medium italic">No Invoice generated yet.</p>
              ) : (
                <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">Status</span>
                    <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-md text-[10px] font-bold uppercase tracking-wider">
                      Generated
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Invoice Number</span>
                    <span className="font-bold text-gray-700">{invoice.invoiceNumber}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowInvoiceModal(true)}
                      className="px-3 py-2 bg-white hover:bg-gray-50 border border-[#E7EAF0] rounded-xl text-xs font-bold text-[#64748B] hover:text-[#1E293B] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadInvoice}
                      className="px-3 py-2 bg-white hover:bg-gray-50 border border-[#E7EAF0] rounded-xl text-xs font-bold text-[#64748B] hover:text-[#1E293B] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      Download
                    </button>
                    <button
                      type="button"
                      onClick={handlePrintInvoice}
                      className="px-3 py-2 bg-white hover:bg-gray-50 border border-[#E7EAF0] rounded-xl text-xs font-bold text-[#64748B] hover:text-[#1E293B] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      Print
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Proof of Delivery Section */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <h5 className="font-poppins font-bold text-xs text-[#1E293B]">Proof of Delivery (POD)</h5>
              {!pod ? (
                <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">Status</span>
                    <span className="font-bold px-2 py-0.5 rounded-md text-[9px] uppercase tracking-wider bg-gray-100 text-gray-500 border border-gray-200">
                      🔴 NOT UPLOADED
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200 mt-2">
                    <button
                      type="button"
                      disabled
                      className="px-2.5 py-2 bg-gray-100 border border-gray-200 rounded-xl text-[10px] font-bold text-gray-400 flex items-center justify-center gap-1 cursor-not-allowed col-span-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </button>
                    <button
                      type="button"
                      disabled
                      className="px-2.5 py-2 bg-gray-100 border border-gray-200 rounded-xl text-[10px] font-bold text-gray-400 flex items-center justify-center gap-1 cursor-not-allowed col-span-1"
                    >
                      Download
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      type="button"
                      disabled
                      className="px-2.5 py-2 bg-gray-100 border border-gray-200 rounded-xl text-[10px] font-bold text-gray-400 cursor-not-allowed"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled
                      className="px-2.5 py-2 bg-gray-100 border border-gray-200 rounded-xl text-[10px] font-bold text-gray-400 cursor-not-allowed"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">Status</span>
                    <span className={`font-bold px-2 py-0.5 rounded-md text-[9px] uppercase tracking-wider ${
                      pod.status === "Approved" || pod.status === "APPROVED" ? "bg-emerald-50 text-emerald-700" :
                      pod.status === "Rejected" || pod.status === "REJECTED" ? "bg-red-50 text-red-600" :
                      "bg-amber-50 text-[#B45A0A]"
                    }`}>
                      {pod.status === "Approved" || pod.status === "APPROVED" ? "🟢 Approved" : pod.status === "Rejected" || pod.status === "REJECTED" ? "🔴 Rejected" : "🟡 PENDING"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Uploaded By</span>
                    <span className="font-bold text-gray-700">{pod.uploadedBy || "Driver"}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowPodModal(true)}
                      className="px-3 py-2 bg-white hover:bg-gray-50 border border-[#E7EAF0] rounded-xl text-xs font-bold text-[#64748B] hover:text-[#1E293B] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Document
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (pod.podDocumentUrl || pod.deliveryPhotoUrl) window.open(pod.podDocumentUrl || pod.deliveryPhotoUrl, "_blank");
                        else toast.error("No document available for download");
                      }}
                      className="px-3 py-2 bg-white hover:bg-gray-50 border border-[#E7EAF0] rounded-xl text-xs font-bold text-[#64748B] hover:text-[#1E293B] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      Download File
                    </button>
                  </div>
                  {(pod.status === 'Pending' || pod.status === 'PENDING' || pod.status === 'Uploaded') && (
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <button
                        type="button"
                        onClick={handlePODApprove}
                        className="px-2.5 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-[10px] font-bold text-emerald-700 transition-colors cursor-pointer"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowRejectModal(true)}
                        className="px-2.5 py-2 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl text-[10px] font-bold text-red-600 transition-colors cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                  {(pod.status === 'Rejected' || pod.status === 'REJECTED') && pod.rejectionReason && (
                    <div className="mt-2 p-2 bg-red-50 text-red-600 text-[10px] rounded-lg border border-red-100">
                      <strong>Reason:</strong> {pod.rejectionReason}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Weighbridge Slip Section */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <h5 className="font-poppins font-bold text-xs text-[#1E293B]">Weighbridge Slip</h5>
              {!weighbridge ? (
                <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">Status</span>
                    <span className="font-bold px-2 py-0.5 rounded-md text-[9px] uppercase tracking-wider bg-gray-100 text-gray-500 border border-gray-200">
                      🔴 NOT UPLOADED
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200 mt-2">
                    <button
                      type="button"
                      disabled
                      className="px-2.5 py-2 bg-gray-100 border border-gray-200 rounded-xl text-[10px] font-bold text-gray-400 flex items-center justify-center gap-1 cursor-not-allowed col-span-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </button>
                    <button
                      type="button"
                      disabled
                      className="px-2.5 py-2 bg-gray-100 border border-gray-200 rounded-xl text-[10px] font-bold text-gray-400 flex items-center justify-center gap-1 cursor-not-allowed col-span-1"
                    >
                      Download
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      type="button"
                      disabled
                      className="px-2.5 py-2 bg-gray-100 border border-gray-200 rounded-xl text-[10px] font-bold text-gray-400 cursor-not-allowed"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled
                      className="px-2.5 py-2 bg-gray-100 border border-gray-200 rounded-xl text-[10px] font-bold text-gray-400 cursor-not-allowed"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">Status</span>
                    <span className={`font-bold px-2 py-0.5 rounded-md text-[9px] uppercase tracking-wider ${
                      weighbridge.status === "Approved" || weighbridge.status === "APPROVED" ? "bg-emerald-50 text-emerald-700" :
                      weighbridge.status === "Rejected" || weighbridge.status === "REJECTED" ? "bg-red-50 text-red-600" :
                      "bg-amber-50 text-[#B45A0A]"
                    }`}>
                      {weighbridge.status === "Approved" || weighbridge.status === "APPROVED" ? "🟢 Approved" : weighbridge.status === "Rejected" || weighbridge.status === "REJECTED" ? "🔴 Rejected" : "🟡 PENDING"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Uploaded By</span>
                    <span className="font-bold text-gray-700">{weighbridge.uploadedBy || "Driver"}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowWeighbridgeModal(true)}
                      className="px-3 py-2 bg-white hover:bg-gray-50 border border-[#E7EAF0] rounded-xl text-xs font-bold text-[#64748B] hover:text-[#1E293B] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Document
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (weighbridge.documentUrl) window.open(weighbridge.documentUrl, "_blank");
                        else toast.error("No document file available");
                      }}
                      className="px-3 py-2 bg-white hover:bg-gray-50 border border-[#E7EAF0] rounded-xl text-xs font-bold text-[#64748B] hover:text-[#1E293B] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      Download File
                    </button>
                  </div>
                  {(weighbridge.status === 'Pending' || weighbridge.status === 'PENDING' || weighbridge.status === 'Uploaded') && (
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <button
                        type="button"
                        onClick={handleWeighbridgeApprove}
                        className="px-2.5 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-[10px] font-bold text-emerald-700 transition-colors cursor-pointer"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowWeighbridgeRejectModal(true)}
                        className="px-2.5 py-2 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl text-[10px] font-bold text-red-600 transition-colors cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                  {(weighbridge.status === 'Rejected' || weighbridge.status === 'REJECTED') && weighbridge.rejectionReason && (
                    <div className="mt-2 p-2 bg-red-50 text-red-600 text-[10px] rounded-lg border border-red-100">
                      <strong>Reason:</strong> {weighbridge.rejectionReason}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- CANCEL DISPATCH CONFIRMATION MODAL --- */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 border border-[#E7EAF0] relative animate-scale-up">
            <button
              onClick={() => setShowCancelConfirm(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1.5 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold font-poppins text-[#1E293B] flex items-center gap-2 text-[#EF4444]">
                  <AlertTriangle className="w-6 h-6 animate-pulse" />
                  Cancel Trip Dispatch
                </h3>
                <p className="text-xs text-[#64748B] mt-1 font-medium">
                  Are you absolutely sure you want to cancel and delete trip logs for dispatch <strong>{trip.tripNumber}</strong>? This action cannot be undone.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E7EAF0]">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="px-4.5 py-2.5 border border-[#E7EAF0] rounded-xl text-xs font-semibold text-[#64748B] hover:text-[#1E293B] transition-colors cursor-pointer"
                >
                  Keep Trip
                </button>
                <button
                  onClick={handleCancelTrip}
                  className="px-5 py-2.5 bg-[#EF4444] hover:bg-red-700 rounded-xl text-xs font-bold text-white transition-all shadow-md cursor-pointer"
                >
                  Cancel Trip Dispatch
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {trip && (
        <DriverChatDrawer 
          isOpen={isChatOpen} 
          onClose={() => setIsChatOpen(false)} 
          driverName={trip.driverName}
          driverPhone={trip.driverPhone}
          initialMessages={[
            {
              id: 1,
              sender: "driver",
              text: `Hi, started transit from ${trip.startLocation}.`,
              time: "10:15 AM",
            },
            {
              id: 2,
              sender: "manager",
              text: `Hi ${trip.driverName.split(" ")[0]}, please drive safe. Destination is ${trip.endLocation}.`,
              time: "10:17 AM",
            }
          ]}
        />
      )}
      {/* --- INVOICE VIEW MODAL --- */}
      {showInvoiceModal && invoice && (
        <div 
          ref={invoiceModalOverlayRef}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-6 md:pt-10 animate-fade-in overflow-y-auto"
        >
          <div 
            ref={invoiceModalContentRef}
            className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl p-6 md:p-8 border border-[#E7EAF0] relative my-4 md:my-6 animate-scale-up max-h-[85vh] overflow-y-auto"
          >
            <button
              onClick={() => setShowInvoiceModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1.5 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Invoice Document Layout */}
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-[#E7EAF0]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-[#B45A0A] rounded-xl flex items-center justify-center text-white font-poppins font-black text-sm">SF</div>
                  <div>
                    <h3 className="font-poppins font-bold text-[#1E293B] text-[18px] leading-tight">Speshway Fleet</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Management System</p>
                  </div>
                </div>
                <div className="text-left md:text-right text-[11px] text-[#64748B] font-medium leading-relaxed font-nunito">
                  <p className="font-bold text-[#1E293B] text-xs">Speshway Logistics Pvt Ltd</p>
                  <p>Plot 45, Industrial Depot, Sector 3</p>
                  <p>Pune, Maharashtra, 411018</p>
                  <p>Phone: +91 20 5566 7788 | Email: billing@speshway.com</p>
                </div>
              </div>

              {/* Invoice Meta */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4.5 bg-gray-50 border border-gray-150 rounded-2xl font-nunito">
                <div>
                  <span className="text-[9px] font-bold text-[#64748B] uppercase tracking-wider block">Invoice Number</span>
                  <span className="font-bold text-xs text-[#1E293B] mt-1 block">{invoice.invoiceNumber}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-[#64748B] uppercase tracking-wider block">Invoice Date</span>
                  <span className="font-bold text-xs text-[#1E293B] mt-1 block">{new Date(invoice.invoiceDate).toLocaleDateString("en-IN")}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-[#64748B] uppercase tracking-wider block">Trip ID</span>
                  <span className="font-bold text-xs text-[#1E293B] mt-1 block">{trip.tripNumber}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-[#64748B] uppercase tracking-wider block">Trip Status</span>
                  <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-[6px] text-[8px] font-bold uppercase ${
                    trip.status === "Completed"
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                      : "bg-blue-50 text-blue-600 border border-blue-100"
                  }`}>
                    {trip.status === "Completed" ? "Complete" : trip.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-nunito">
                {/* Trip Info */}
                <div className="space-y-3.5">
                  <h4 className="font-poppins font-bold text-[11px] text-[#64748B] uppercase tracking-wider border-b border-[#E7EAF0] pb-1.5">Trip Information</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between"><span className="text-gray-500 font-medium font-nunito">Departure Date & Time</span><span className="font-bold text-gray-700">{formatDateTime(trip.departureTime)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500 font-medium font-nunito">Estimated Arrival</span><span className="font-bold text-gray-700">{formatDateTime(trip.eta)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500 font-medium font-nunito">Distance</span><span className="font-bold text-gray-700">{distanceVal} KM</span></div>
                    <div className="flex justify-between"><span className="text-gray-500 font-medium font-nunito">Cargo Type</span><span className="font-bold text-gray-700">{trip.cargoType || "General Cargo"}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500 font-medium font-nunito">Cargo Weight</span><span className="font-bold text-gray-700">{trip.cargoWeight || 0} kg</span></div>
                    <div className="flex justify-between"><span className="text-gray-500 font-medium font-nunito">Trip Notes</span><span className="font-bold text-gray-700">{trip.tripNotes || "None"}</span></div>
                  </div>
                </div>

                {/* Assets Info */}
                <div className="space-y-6">
                  {/* Vehicle Info */}
                  <div className="space-y-3.5">
                    <h4 className="font-poppins font-bold text-[11px] text-[#64748B] uppercase tracking-wider border-b border-[#E7EAF0] pb-1.5">Vehicle Information</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between"><span className="text-gray-500 font-medium font-nunito">Vehicle Name</span><span className="font-bold text-gray-700">{trip.vehicleName || "N/A"}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500 font-medium font-nunito">Registration Number</span><span className="font-bold text-gray-700">{trip.vehiclePlate || "N/A"}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500 font-medium font-nunito">Vehicle Type</span><span className="font-bold text-gray-700">{trip.vehicle?.vehicleType || "Truck"}</span></div>
                    </div>
                  </div>

                  {/* Driver Info */}
                  <div className="space-y-3.5">
                    <h4 className="font-poppins font-bold text-[11px] text-[#64748B] uppercase tracking-wider border-b border-[#E7EAF0] pb-1.5">Driver Information</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between"><span className="text-gray-500 font-medium font-nunito">Driver Name</span><span className="font-bold text-gray-700">{trip.driverName || "N/A"}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500 font-medium font-nunito">Employee ID</span><span className="font-bold text-gray-700">{formatEmployeeId(trip.driver?.employeeId)}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500 font-medium font-nunito">Mobile Number</span><span className="font-bold text-gray-700">{trip.driverPhone || trip.driver?.phoneNumber || trip.driver?.phone || "N/A"}</span></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* FROM ADDRESS & TO ADDRESS Two-Column Section */}
              {(() => {
                const fromAddr = getFormattedInvoiceAddress(trip.pickupAddress || trip.fromAddress, trip.startLocation);
                const toAddr = getFormattedInvoiceAddress(trip.deliveryAddress || trip.toAddress, trip.endLocation);
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#E7EAF0] font-nunito">
                    {/* FROM ADDRESS */}
                    <div className="bg-slate-50/80 p-4.5 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                      <h4 className="font-poppins font-bold text-[11px] text-[#B45A0A] uppercase tracking-wider border-b border-slate-200 pb-2 mb-2">
                        FROM ADDRESS
                      </h4>
                      <div className="font-bold text-slate-800 text-sm mb-1">{fromAddr.companyName}</div>

                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contact Person</div>
                        <div className="font-bold text-slate-700 text-xs mt-0.5">{fromAddr.contactPerson}</div>
                      </div>

                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mobile</div>
                        <div className="font-bold text-slate-700 text-xs mt-0.5">{fromAddr.mobile}</div>
                      </div>

                      <div className="text-slate-700">
                        <div>{fromAddr.streetAddress}</div>
                        {fromAddr.area && <div>{fromAddr.area}</div>}
                      </div>

                      <div className="text-slate-800 font-bold pt-1.5 border-t border-slate-200/60">
                        <div>{fromAddr.city}</div>
                        <div>{fromAddr.state}{fromAddr.pincode ? ` - ${fromAddr.pincode}` : ''}</div>
                      </div>
                    </div>

                    {/* TO ADDRESS */}
                    <div className="bg-slate-50/80 p-4.5 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                      <h4 className="font-poppins font-bold text-[11px] text-[#B45A0A] uppercase tracking-wider border-b border-slate-200 pb-2 mb-2">
                        TO ADDRESS
                      </h4>
                      <div className="font-bold text-slate-800 text-sm mb-1">{toAddr.companyName}</div>

                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contact Person</div>
                        <div className="font-bold text-slate-700 text-xs mt-0.5">{toAddr.contactPerson}</div>
                      </div>

                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mobile</div>
                        <div className="font-bold text-slate-700 text-xs mt-0.5">{toAddr.mobile}</div>
                      </div>

                      <div className="text-slate-700">
                        <div>{toAddr.streetAddress}</div>
                        {toAddr.area && <div>{toAddr.area}</div>}
                      </div>

                      <div className="text-slate-800 font-bold pt-1.5 border-t border-slate-200/60">
                        <div>{toAddr.city}</div>
                        <div>{toAddr.state}{toAddr.pincode ? ` - ${toAddr.pincode}` : ''}</div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Creator details */}
              <div className="pt-4 border-t border-[#E7EAF0] flex flex-col sm:flex-row justify-between text-[10px] text-[#64748B] font-semibold gap-2">
                <span>Created By: <strong>{invoice.createdBy?.fullName || "Manager"}</strong></span>
                <span>Created Date & Time: <strong>{new Date(invoice.createdAt || invoice.invoiceDate).toLocaleString("en-IN")}</strong></span>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-[#E7EAF0]">
                <button
                  type="button"
                  onClick={() => setShowInvoiceModal(false)}
                  className="px-4.5 py-2.5 border border-[#E7EAF0] rounded-xl text-xs font-semibold text-[#64748B] hover:text-[#1E293B] transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handlePrintInvoice}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-black rounded-xl text-xs font-bold text-white transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  Print Invoice
                </button>
                <button
                  type="button"
                  onClick={handleDownloadInvoice}
                  className="px-5 py-2.5 bg-[#B45A0A] hover:bg-[#9A4D08] rounded-xl text-xs font-bold text-white transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- POD VIEW MODAL --- */}
      {showPodModal && pod && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl p-6 border border-[#E7EAF0] relative my-8 animate-scale-up">
            <button
              onClick={() => setShowPodModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1.5 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold font-poppins text-[#1E293B] mb-4">Proof of Delivery</h3>
            <div className="space-y-4 text-sm text-[#64748B]">
              {pod.customerSignatureUrl ? (
                <div>
                  <h4 className="font-bold text-[#1E293B]">Customer Signature Preview</h4>
                  <img src={pod.customerSignatureUrl} alt="Customer Signature" className="mt-2 max-h-40 border border-gray-200 rounded-lg" />
                </div>
              ) : (
                <p>No customer signature preview available.</p>
              )}
              {pod.deliveryPhotoUrl ? (
                <div>
                  <h4 className="font-bold text-[#1E293B]">Delivery Photo Preview</h4>
                  <img src={pod.deliveryPhotoUrl} alt="Delivery Photo" className="mt-2 max-h-60 border border-gray-200 rounded-lg object-contain" />
                </div>
              ) : (
                <p>No delivery photo available.</p>
              )}
              {pod.podDocumentUrl ? (
                <div>
                  <h4 className="font-bold text-[#1E293B]">POD Document</h4>
                  <a href={pod.podDocumentUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline mt-1 inline-block">
                    View POD Document (PDF/Image)
                  </a>
                </div>
              ) : (
                <p>No POD document uploaded.</p>
              )}
            </div>

            <div className="flex justify-end pt-4 mt-6 border-t border-[#E7EAF0]">
              <button
                onClick={() => setShowPodModal(false)}
                className="px-4.5 py-2.5 bg-slate-900 hover:bg-black rounded-xl text-xs font-bold text-white transition-all shadow-md cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- RECEIPT VIEW MODAL --- */}
      {selectedTollReceipt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 border border-[#E7EAF0] relative my-8 animate-scale-up font-nunito">
            <button
              onClick={() => setSelectedTollReceipt(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1.5 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="text-center pb-4 border-b border-dashed border-gray-200">
              <div className="mx-auto w-12 h-12 bg-blue-600 rounded-2xl flex flex-col items-center justify-center text-white font-poppins font-black text-xs shadow-md shadow-blue-200">
                <span className="leading-none text-[8px] uppercase tracking-wider font-bold opacity-85">NHAI</span>
                <span className="leading-none text-[10px] font-black tracking-tighter">FASTag</span>
              </div>
              <h3 className="font-poppins font-bold text-[#1E293B] text-[15px] mt-2.5">Toll Transaction Receipt</h3>
              <p className="text-[9px] text-[#64748B] font-bold uppercase tracking-wider mt-0.5">National Highways Authority of India</p>
            </div>

            {/* Amount Display */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-center mt-4">
              <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider block">Transaction Amount</span>
              <span className="text-2xl font-black text-indigo-600 font-poppins mt-1 block">₹{selectedTollReceipt.amountPaid.toFixed(2)}</span>
              <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-50 text-emerald-600 border border-emerald-100/60">
                Transaction {selectedTollReceipt.receiptStatus}
              </span>
            </div>

            {/* Receipt Details */}
            <div className="space-y-2.5 text-xs border-b border-dashed border-gray-200 pb-4 mt-4">
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Toll Plaza Name</span>
                <span className="font-bold text-gray-700">{selectedTollReceipt.tollPlazaName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Location</span>
                <span className="font-bold text-gray-700">{selectedTollReceipt.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Date & Time</span>
                <span className="font-bold text-gray-700">
                  {new Date(selectedTollReceipt.dateTime).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'medium'
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Vehicle Plate</span>
                <span className="font-bold text-gray-700">{selectedTollReceipt.vehiclePlate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Payment Mode</span>
                <span className="font-bold text-[#1E293B] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  {selectedTollReceipt.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">FASTag Tx ID</span>
                <span className="font-bold font-mono text-gray-600">{selectedTollReceipt.fastagTransactionId}</span>
              </div>
            </div>

            {/* Footer text */}
            <p className="text-[10px] text-[#64748B] text-center font-medium leading-relaxed mt-4">
              This transaction was processed electronically via FASTag system. No signature is required.
            </p>

            {/* Action buttons */}
            <div className="flex gap-2 mt-4">
              <button
                type="button"
                onClick={() => setSelectedTollReceipt(null)}
                className="flex-1 py-2 border border-[#E7EAF0] rounded-xl text-xs font-bold text-[#64748B] hover:text-[#1E293B] hover:bg-gray-50 transition-all cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const printWindow = window.open("", "_blank");
                  printWindow.document.write(`
                    <html>
                      <head>
                        <title>FASTag Receipt</title>
                        <style>
                          body { font-family: 'Nunito', sans-serif; color: #1E293B; padding: 40px; text-align: center; }
                          .receipt-box { max-width: 400px; margin: auto; padding: 20px; border: 1px dashed #B2C2D3; border-radius: 12px; }
                          .nhai-logo { width: 50px; height: 50px; background: #2563EB; border-radius: 12px; margin: 0 auto 10px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 10px; }
                          .amount { font-size: 24px; font-weight: bold; color: #4F46E5; margin: 15px 0; }
                          .details { text-align: left; margin: 20px 0; }
                          .row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 13px; }
                          .label { color: #64748B; }
                          .val { font-weight: bold; }
                        </style>
                      </head>
                      <body onload="window.print(); window.close();">
                        <div class="receipt-box">
                          <div class="nhai-logo">
                            <span style="font-size:8px;opacity:0.8;">NHAI</span>
                            <span>FASTag</span>
                          </div>
                          <h3>FASTag Toll Receipt</h3>
                          <div class="amount">₹\${selectedTollReceipt.amountPaid.toFixed(2)}</div>
                          <div class="details">
                            <div class="row"><span class="label">Toll Plaza</span><span class="val">\${selectedTollReceipt.tollPlazaName}</span></div>
                            <div class="row"><span class="label">Location</span><span class="val">\${selectedTollReceipt.location}</span></div>
                            <div class="row"><span class="label">Date & Time</span><span class="val">\${new Date(selectedTollReceipt.dateTime).toLocaleString('en-IN')}</span></div>
                            <div class="row"><span class="label">Vehicle Plate</span><span class="val">\${selectedTollReceipt.vehiclePlate}</span></div>
                            <div class="row"><span class="label">Payment Method</span><span class="val">\${selectedTollReceipt.paymentMethod}</span></div>
                            <div class="row"><span class="label">Transaction ID</span><span class="val">\${selectedTollReceipt.fastagTransactionId}</span></div>
                            <div class="row"><span class="label">Status</span><span class="val">\${selectedTollReceipt.receiptStatus}</span></div>
                          </div>
                          <p style="font-size:10px;color:#64748B;">This is a computer generated receipt for electronic toll collection.</p>
                        </div>
                      </body>
                    </html>
                  `);
                  printWindow.document.close();
                }}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-xs font-bold text-white transition-all shadow-md cursor-pointer"
              >
                Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- REJECT REASON MODAL --- */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl p-6 border border-[#E7EAF0] relative animate-scale-up">
            <button
              onClick={() => {
                setShowRejectModal(false);
                setRejectReason("");
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1.5 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold font-poppins text-[#1E293B] mb-2 text-[#EF4444]">
              Reject Proof of Delivery
            </h3>
            <p className="text-xs text-gray-500 mb-4">Please provide a reason for rejection.</p>
            
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm mb-4 outline-none focus:border-[#B45A0A]"
              placeholder="Enter rejection reason..."
              rows={3}
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePODReject}
                className="px-4 py-2 bg-[#EF4444] hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors"
              >
                Submit Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- WEIGHBRIDGE VIEW MODAL --- */}
      {showWeighbridgeModal && weighbridge && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl p-6 border border-[#E7EAF0] relative my-8 animate-scale-up">
            <button
              onClick={() => setShowWeighbridgeModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1.5 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold font-poppins text-[#1E293B] mb-4">Weighbridge Slip</h3>
            <div className="space-y-4 text-sm text-[#64748B]">
              {weighbridge.documentUrl ? (
                <div>
                  <h4 className="font-bold text-[#1E293B]">Weighbridge Document</h4>
                  <a href={weighbridge.documentUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline mt-1 inline-block">
                    View Document (PDF/Image)
                  </a>
                </div>
              ) : (
                <p>No document available.</p>
              )}
            </div>
            <div className="flex justify-end pt-4 mt-6 border-t border-[#E7EAF0]">
              <button
                onClick={() => setShowWeighbridgeModal(false)}
                className="px-4.5 py-2.5 bg-slate-900 hover:bg-black rounded-xl text-xs font-bold text-white transition-all shadow-md cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- WEIGHBRIDGE REJECT REASON MODAL --- */}
      {showWeighbridgeRejectModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl p-6 border border-[#E7EAF0] relative animate-scale-up">
            <button
              onClick={() => {
                setShowWeighbridgeRejectModal(false);
                setWeighbridgeRejectReason("");
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1.5 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold font-poppins text-[#1E293B] mb-2 text-[#EF4444]">
              Reject Weighbridge Slip
            </h3>
            <textarea
              value={weighbridgeRejectReason}
              onChange={(e) => setWeighbridgeRejectReason(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm mb-4 outline-none focus:border-[#B45A0A]"
              placeholder="Enter rejection reason..."
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowWeighbridgeRejectModal(false);
                  setWeighbridgeRejectReason("");
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleWeighbridgeReject}
                className="px-4 py-2 bg-[#EF4444] hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors"
              >
                Submit Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- TOLL RECEIPTS VIEW MODAL --- */}
      {showTollModal && toll && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl p-6 border border-[#E7EAF0] relative my-8 animate-scale-up">
            <button
              onClick={() => setShowTollModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1.5 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold font-poppins text-[#1E293B] mb-4">Toll Receipts</h3>
            <div className="space-y-4 text-sm text-[#64748B]">
              {toll.receipts && toll.receipts.length > 0 ? (
                toll.receipts.map((receipt, idx) => (
                  <div key={idx} className="p-3 border border-gray-100 rounded-xl">
                    <p className="font-bold text-[#1E293B] mb-1">Receipt #{idx + 1}</p>
                    <p>Amount: ${receipt.amount}</p>
                    <p>Location: {receipt.location}</p>
                    <a href={receipt.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline text-xs mt-1 inline-block">
                      View Receipt
                    </a>
                  </div>
                ))
              ) : (
                <p>No toll receipts details available.</p>
              )}
            </div>
            <div className="flex justify-end pt-4 mt-6 border-t border-[#E7EAF0]">
              <button
                onClick={() => setShowTollModal(false)}
                className="px-4.5 py-2.5 bg-slate-900 hover:bg-black rounded-xl text-xs font-bold text-white transition-all shadow-md cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- TOLL REJECT REASON MODAL --- */}
      {showTollRejectModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl p-6 border border-[#E7EAF0] relative animate-scale-up">
            <button
              onClick={() => {
                setShowTollRejectModal(false);
                setTollRejectReason("");
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1.5 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold font-poppins text-[#1E293B] mb-2 text-[#EF4444]">
              Reject Toll Receipts
            </h3>
            <textarea
              value={tollRejectReason}
              onChange={(e) => setTollRejectReason(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm mb-4 outline-none focus:border-[#B45A0A]"
              placeholder="Enter rejection reason..."
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowTollRejectModal(false);
                  setTollRejectReason("");
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleTollReject}
                className="px-4 py-2 bg-[#EF4444] hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors"
              >
                Submit Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- RECEIPT VIEW MODAL --- */}
      {selectedTollReceipt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 border border-[#E7EAF0] relative my-8 animate-scale-up font-nunito">
            <button
              onClick={() => setSelectedTollReceipt(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1.5 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Receipt Content */}
            <div className="space-y-5">
              {/* Header */}
              <div className="text-center pb-4 border-b border-dashed border-gray-200">
                <div className="mx-auto w-12 h-12 bg-blue-600 rounded-2xl flex flex-col items-center justify-center text-white font-poppins font-black text-xs shadow-md shadow-blue-200">
                  <span className="leading-none text-[8px] uppercase tracking-wider font-bold opacity-85">NHAI</span>
                  <span className="leading-none text-[10px] font-black tracking-tighter">FASTag</span>
                </div>
                <h3 className="font-poppins font-bold text-[#1E293B] text-[15px] mt-2.5">Toll Transaction Receipt</h3>
                <p className="text-[9px] text-[#64748B] font-bold uppercase tracking-wider mt-0.5">National Highways Authority of India</p>
              </div>

              {/* Amount Display */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-center">
                <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider block">Transaction Amount</span>
                <span className="text-2xl font-black text-indigo-600 font-poppins mt-1 block">₹{selectedTollReceipt.amountPaid.toFixed(2)}</span>
                <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-50 text-emerald-600 border border-emerald-100/60">
                  Transaction {selectedTollReceipt.receiptStatus}
                </span>
              </div>

              {/* Receipt Details */}
              <div className="space-y-2.5 text-xs border-b border-dashed border-gray-200 pb-4">
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Toll Plaza Name</span>
                  <span className="font-bold text-gray-700">{selectedTollReceipt.tollPlazaName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Location</span>
                  <span className="font-bold text-gray-700">{selectedTollReceipt.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Date & Time</span>
                  <span className="font-bold text-gray-700">
                    {new Date(selectedTollReceipt.dateTime).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'medium'
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Vehicle Plate</span>
                  <span className="font-bold text-gray-700">{selectedTollReceipt.vehiclePlate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Payment Mode</span>
                  <span className="font-bold text-[#1E293B] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    {selectedTollReceipt.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">FASTag Tx ID</span>
                  <span className="font-bold font-mono text-gray-600">{selectedTollReceipt.fastagTransactionId}</span>
                </div>
              </div>

              {/* Footer text */}
              <p className="text-[10px] text-[#64748B] text-center font-medium leading-relaxed">
                This transaction was processed electronically via FASTag system. No signature is required.
              </p>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTollReceipt(null)}
                  className="flex-1 py-2 border border-[#E7EAF0] rounded-xl text-xs font-bold text-[#64748B] hover:text-[#1E293B] hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const printWindow = window.open("", "_blank");
                    printWindow.document.write(`
                      <html>
                        <head>
                          <title>FASTag Receipt</title>
                          <style>
                            body { font-family: 'Nunito', sans-serif; color: #1E293B; padding: 40px; text-align: center; }
                            .receipt-box { max-width: 400px; margin: auto; padding: 20px; border: 1px dashed #B2C2D3; border-radius: 12px; }
                            .nhai-logo { width: 50px; height: 50px; background: #2563EB; border-radius: 12px; margin: 0 auto 10px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 10px; }
                            .amount { font-size: 24px; font-weight: bold; color: #4F46E5; margin: 15px 0; }
                            .details { text-align: left; margin: 20px 0; }
                            .row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 13px; }
                            .label { color: #64748B; }
                            .val { font-weight: bold; }
                          </style>
                        </head>
                        <body onload="window.print(); window.close();">
                          <div class="receipt-box">
                            <div class="nhai-logo">
                              <span style="font-size:8px;opacity:0.8;">NHAI</span>
                              <span>FASTag</span>
                            </div>
                            <h3>FASTag Toll Receipt</h3>
                            <div class="amount">₹\${selectedTollReceipt.amountPaid.toFixed(2)}</div>
                            <div class="details">
                              <div class="row"><span class="label">Toll Plaza</span><span class="val">\${selectedTollReceipt.tollPlazaName}</span></div>
                              <div class="row"><span class="label">Location</span><span class="val">\${selectedTollReceipt.location}</span></div>
                              <div class="row"><span class="label">Date & Time</span><span class="val">\${new Date(selectedTollReceipt.dateTime).toLocaleString('en-IN')}</span></div>
                              <div class="row"><span class="label">Vehicle Plate</span><span class="val">\${selectedTollReceipt.vehiclePlate}</span></div>
                              <div class="row"><span class="label">Payment Method</span><span class="val">\${selectedTollReceipt.paymentMethod}</span></div>
                              <div class="row"><span class="label">Transaction ID</span><span class="val">\${selectedTollReceipt.fastagTransactionId}</span></div>
                              <div class="row"><span class="label">Status</span><span class="val">\${selectedTollReceipt.receiptStatus}</span></div>
                            </div>
                            <p style="font-size:10px;color:#64748B;">This is a computer generated receipt for electronic toll collection.</p>
                          </div>
                        </body>
                      </html>
                    `);
                    printWindow.document.close();
                  }}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-xs font-bold text-white transition-all shadow-md cursor-pointer"
                >
                  Print Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
