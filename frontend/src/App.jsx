import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [algorithm, setAlgorithm] = useState('Haversine AI');
  const [activeSimulation, setActiveSimulation] = useState(false);
  const [logisticsData, setLogisticsData] = useState(null);
  const [loadingSim, setLoadingSim] = useState(false);

  const clienteCoordenadas = { latitude: -12.0463, longitude: -77.0427 };

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/products/')
      .then(response => {
        setProducts(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error conectando con la API de Django:", error);
        setLoading(false);
      });
  }, []);

  const handleStartSimulation = () => {
    if (activeSimulation) {
      setActiveSimulation(false);
      setLogisticsData(null);
      return;
    }

    setLoadingSim(true);
    setActiveSimulation(true);

    axios.post('http://127.0.0.1:8000/api/orders/simulate-routing/', clienteCoordenadas)
      .then(response => {
        setLogisticsData(response.data);
        setLoadingSim(false);
      })
      .catch(error => {
        console.error("Error en el ruteo geoespacial:", error);
        setLoadingSim(false);
      });
  };

  return (
    <div style={{
      backgroundColor: '#0f172a',
      color: '#f8fafc',
      minHeight: '100vh',
      fontFamily: 'system-ui, sans-serif',
      padding: '24px'
    }}>
      <header style={{
        borderBottom: '1px solid #334155',
        paddingBottom: '16px',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '28px', color: '#38bdf8' }}>LiquidRoute AI</h1>
          <p style={{ margin: '4px 0 0 0', color: '#94a3b8' }}>Sistema Avandado de Micro-Fulfillment & Orquestación Logística</p>
        </div>
        <div style={{
          backgroundColor: '#1e293b',
          padding: '8px 16px',
          borderRadius: '8px',
          border: '1px solid #334155',
          fontSize: '14px'
        }}>
          Estado Backend: <span style={{ color: '#4ade80', fontWeight: 'bold' }}>● Operacional</span>
        </div>
      </header>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        gap: '24px',
        marginBottom: '24px'
      }}>
        <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
          <h3 style={{ marginTop: 0, borderBottom: '1px solid #334155', paddingBottom: '8px' }}>Control de Simulación</h3>
          
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#94a3b8' }}>Algoritmo Logístico</label>
            <select 
              value={algorithm} 
              onChange={(e) => setAlgorithm(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #475569' }}
            >
              <option value="Haversine AI">Optimización Haversine (Fórmula de Distancia Real)</option>
            </select>
          </div>

          <button 
            onClick={handleStartSimulation}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '6px',
              backgroundColor: activeSimulation ? '#ef4444' : '#2563eb',
              color: '#fff',
              border: 'none',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: '0.2s'
            }}
          >
            {activeSimulation ? 'Detener Red Logística' : 'Inicializar Grid Logística'}
          </button>
        </div>

        <div style={{ 
          backgroundColor: '#1e293b', 
          padding: '20px', 
          borderRadius: '12px', 
          border: '1px solid #334155',
          minHeight: '260px'
        }}>
          <h3 style={{ marginTop: 0, borderBottom: '1px solid #334155', paddingBottom: '8px', color: '#38bdf8' }}>
            📡 Consola Geofencing en Tiempo Real
          </h3>
          
          {loadingSim ? (
            <p>Calculando distancias métricas con los servidores satelitales...</p>
          ) : logisticsData ? (
            <div>
              <div style={{ backgroundColor: '#10b981', color: '#fff', padding: '10px', borderRadius: '6px', marginBottom: '16px' }}>
                <strong>🚀 Almacén Óptimo Detectado:</strong> {logisticsData.almacen_optimo?.nombre} ({logisticsData.almacen_optimo?.distancia_km} km de distancia)
              </div>
              <h4>Nodos Analizados en la Red:</h4>
              <ul>
                {logisticsData.red_de_nodos.map(node => (
                  <li key={node.id} style={{ marginBottom: '8px', fontSize: '14px' }}>
                    🏢 <strong>{node.nombre}</strong> a <strong>{node.distancia_km} KM</strong> del cliente.
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#64748b', paddingTop: '40px' }}>
              <p style={{ fontSize: '48px', margin: 0 }}>🌐</p>
              <h4>Malla Logística Inactiva</h4>
              <p style={{ fontSize: '14px' }}>Haz clic en "Inicializar Grid" para disparar el cálculo de coordenadas matemáticas en el Backend.</p>
            </div>
          )}
        </div>
      </div>

      <section style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
        <h3 style={{ marginTop: 0, borderBottom: '1px solid #334155', paddingBottom: '8px', color: '#a855f7' }}>
          📦 Catálogo Global de Productos (Sincronizado vía Django REST API)
        </h3>
        {loading ? (
          <p>Cargando productos...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            {products.map(p => (
              <div key={p.id} style={{ backgroundColor: '#0f172a', padding: '16px', borderRadius: '8px', border: '1px solid #334155' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#fff' }}>{p.name}</h4>
                <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 8px 0' }}>SKU: {p.sku}</p>
                <p style={{ color: '#38bdf8', margin: 0, fontWeight: 'bold', fontSize: '18px' }}>S/. {p.price}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default App;