import React, { useState, useEffect } from "react";
import { 
  TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, 
  Calendar, Package, AlertCircle, ShoppingCart 
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart as RePieChart, Pie, Cell 
} from "recharts";
import adminService from "../services/adminService";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [bestProduct, setBestProduct] = useState(null);
  const [worstProduct, setWorstProduct] = useState(null);
  const [profitData, setProfitData] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  
  // States for filters
  const [dateRange, setDateRange] = useState("last30");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });
  const [selectedProductId, setSelectedProductId] = useState("all");
  const [singleProductAnalytics, setSingleProductAnalytics] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedProductId === "all") {
        fetchDashboardData();
    } else {
        fetchSingleProductAnalytics();
    }
  }, [dateRange, customRange, selectedProductId]);

  const fetchInitialData = async () => {
    try {
        const { products } = await adminService.getAllProductsAnalytics();
        setAllProducts(products);
    } catch (err) {
        console.error("Initial data fetch error:", err);
    }
  }

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (dateRange !== "all-time") {
          const range = calculateDateRange(dateRange);
          if (range) {
              params.startDate = range.start;
              params.endDate = range.end;
          }
      }
      
      const data = await adminService.getDashboardSummary(params);
      setSummary(data.summary);
      setBestProduct(data.bestProduct);
      setWorstProduct(data.worstProduct);
      setProfitData(data.profitPerProduct);
      setSingleProductAnalytics(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSingleProductAnalytics = async () => {
      setLoading(true);
      try {
        const params = {};
        if (dateRange !== "all-time") {
            const range = calculateDateRange(dateRange);
            if (range) {
                params.startDate = range.start;
                params.endDate = range.end;
            }
        }
        const { analytics } = await adminService.getProductAnalytics(selectedProductId, params);
        setSingleProductAnalytics(analytics);
      } catch (err) {
          setError(err.message);
      } finally {
          setLoading(false);
      }
  }

  const calculateDateRange = (range) => {
    const today = new Date();
    const end = today.toISOString();
    let start = new Date();

    if (range === "today") {
      start.setHours(0, 0, 0, 0);
    } else if (range === "last7") {
      start.setDate(today.getDate() - 7);
    } else if (range === "last30") {
      start.setDate(today.getDate() - 30);
    } else if (range === "custom") {
      if (customRange.start && customRange.end) {
          return { start: customRange.start, end: customRange.end };
      }
      return null;
    } else {
        return null;
    }
    
    return { start: start.toISOString(), end };
  };

  const COLORS = ["#3b82f6", "#10b981", "#eab308", "#a855f7", "#ef4444"];

  if (loading && !summary && !singleProductAnalytics) return <div className="admin-loading-container"><div className="loader"></div><p>Loading analytics...</p></div>;

  return (
    <div className="dashboard-page">
      <div className="section-header">
        <h1>Business Analytics Dashboard</h1>
        
        <div className="filters-bar">
          <div className="filter-group">
            <Calendar size={18} className="filter-icon" />
            <select 
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)}
              className="form-input date-filter-select"
            >
              <option value="today">Today</option>
              <option value="last7">Last 7 Days</option>
              <option value="last30">Last 30 Days</option>
              <option value="all-time">All Time</option>
              {/* <option value="custom">Custom Range</option> */}
            </select>
          </div>

          <div className="filter-group">
            <Package size={18} className="filter-icon" />
            <select 
              value={selectedProductId} 
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="form-input product-filter-select"
            >
              <option value="all">All Products</option>
              {allProducts.map(p => (
                  <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {singleProductAnalytics ? (
        <div className="single-product-analytics">
            <div className="dashboard-grid">
                <MetricCard icon={DollarSign} title="Total Revenue" value={`₹${singleProductAnalytics.totalRevenue?.toFixed(2)}`} color="revenue" />
                <MetricCard icon={PieChart} title="Total Profit" value={`₹${singleProductAnalytics.profit?.toFixed(2)}`} color="profit" />
                <MetricCard icon={TrendingUp} title="ROI" value={`${singleProductAnalytics.roi?.toFixed(2)}%`} color="roi" />
                <MetricCard icon={TrendingUp} title="Margin" value={`${singleProductAnalytics.margin?.toFixed(2)}%`} color="margin" />
            </div>

            <div className="admin-card product-info-card profile-mb-30">
                <h2 className="admin-card-title">Product Detailed View: {singleProductAnalytics.name}</h2>
                <div className="product-status-grid product-details-grid-custom">
                    <div>
                        <div className="product-status"><span>Product Name</span><span>{singleProductAnalytics.name}</span></div>
                        <div className="product-status"><span>Selling Price (MRP)</span><span>₹{singleProductAnalytics.sellingPrice?.toFixed(2)}</span></div>
                        <div className="product-status"><span>Cost Price</span><span>₹{singleProductAnalytics.costPrice?.toFixed(2)}</span></div>
                        <div className="product-status"><span>Total Orders</span><span>{singleProductAnalytics.totalOrders}</span></div>
                        <div className="product-status"><span>Delivered Orders</span><span>{singleProductAnalytics.deliveredOrders}</span></div>
                        <div className="product-status"><span>Returned Orders</span><span>{singleProductAnalytics.returnedOrders}</span></div>
                    </div>
                    <div>
                        <div className="product-status"><span>Total Revenue</span><span>₹{singleProductAnalytics.totalRevenue?.toFixed(2)}</span></div>
                        <div className="product-status"><span>Total Cost</span><span>₹{singleProductAnalytics.totalCost?.toFixed(2)}</span></div>
                        <div className="product-status"><span>Total Profit</span><span>₹{singleProductAnalytics.profit?.toFixed(2)}</span></div>
                        <div className="product-status"><span>Margin (%)</span><span>{singleProductAnalytics.margin?.toFixed(2)}%</span></div>
                        <div className="product-status"><span>ROI (%)</span><span>{singleProductAnalytics.roi?.toFixed(2)}%</span></div>
                    </div>
                </div>
            </div>
        </div>
      ) : (
        <>
          <div className="dashboard-grid">
            <MetricCard icon={DollarSign} title="Total Revenue" value={`₹${summary?.totalRevenue?.toFixed(2)}`} color="revenue" />
            <MetricCard icon={PieChart} title="Total Profit" value={`₹${summary?.totalProfit?.toFixed(2)}`} color="profit" />
            <MetricCard icon={Package} title="Confirmed Orders" value={summary?.confirmedCount + summary?.deliveredCount + summary?.shippedCount} color="roi" />
            <MetricCard icon={AlertCircle} title="Cancelled Orders" value={summary?.cancelledCount} color="margin" />
          </div>
          <div className="dashboard-grid profile-mt-20">
            <MetricCard icon={ShoppingCart} title="Items Sold" value={summary?.totalItemsSold} color="revenue" />
            <MetricCard icon={TrendingUp} title="Overall ROI" value={`${summary?.roi?.toFixed(2)}%`} color="roi" />
            <MetricCard icon={TrendingUp} title="Overall Margin" value={`${summary?.margin?.toFixed(2)}%`} color="margin" />
            <MetricCard icon={Package} title="Total Orders Life-time" value={summary?.totalOrders} color="profit" />
          </div>

          <div className="charts-row">
            <div className="admin-card">
              <h3 className="admin-card-title">Profit Per Product</h3>
              <div className="chart-box">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={profitData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip cursor={{fill: '#f1f5f9'}} />
                    <Bar dataKey="profit" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="admin-card">
              <h3 className="admin-card-title">ROI Comparison</h3>
              <div className="chart-box">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={profitData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="roi"
                    >
                      {profitData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="best-worst-products">
            <HighlightCard 
                type="best" 
                title="Best Performing Product" 
                product={bestProduct} 
                metric="Profit" 
                value={`₹${bestProduct?.totalProfit?.toFixed(2)}`}
            />
            <HighlightCard 
                type="worst" 
                title="Worst Performing Product" 
                product={worstProduct} 
                metric="Profit" 
                value={`₹${worstProduct?.totalProfit?.toFixed(2)}`}
            />
          </div>
        </>
      )}
    </div>
  );
};

const MetricCard = ({ icon: Icon, title, value, color }) => (
  <div className="metric-card">
    <div className={`metric-icon ${color}`}>
      <Icon size={24} />
    </div>
    <div className="metric-info">
      <h3>{title}</h3>
      <div className="metric-value">{value}</div>
    </div>
  </div>
);

const HighlightCard = ({ type, title, product, metric, value }) => (
   <div className={`admin-card highlight-card ${type}`}>
    <div className="highlight-card-header">
        <div>
            <span className={`performance-badge badge-${type}`}>
                {type === 'best' ? 'Top Performer' : 'Underperformer'}
            </span>
            <h3 className="highlight-card-title">{title}</h3>
        </div>
        {type === 'best' ? <TrendingUp className="text-green-500" /> : <TrendingDown className="text-red-500" />}
    </div>
    
    <div className="highlight-content-box">
        {product ? (
            <>
                <div className="highlight-product-name">{product.name}</div>
                <div className="highlight-metric-row">
                    <span>{metric}:</span>
                    <span className="highlight-metric-value" style={{ color: type === 'best' ? '#10b981' : '#ef4444' }}>{value}</span>
                </div>
            </>
        ) : (
            <div className="highlight-empty">No data available</div>
        )}
    </div>
  </div>
);

export default Dashboard;
