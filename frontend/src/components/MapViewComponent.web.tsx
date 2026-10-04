import React, { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Map, { Marker, MapRef } from 'react-map-gl/mapbox';
// @ts-ignore
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapViewComponentProps, MapMarker } from './MapViewComponent';

const DEFAULT_MAPBOX_TOKEN =
  'pk.eyJ1IjoibWFpZHVjdHVuZyIsImEiOiJjbXVtOGlqMm8wOTU5MnhvZmM5bXBqYnYyIn0.OAm5O7g64WWuibNsc-EWGQ';

export const MapViewComponent: React.FC<MapViewComponentProps> = ({
  markers,
  initialRegion,
  centerCoordinate,
  style,
}) => {
  const mapboxToken = process.env.EXPO_PUBLIC_MAPBOX_TOKEN || DEFAULT_MAPBOX_TOKEN;
  const mapRef = useRef<MapRef>(null);

  // Đảm bảo CSS của Mapbox GL được nhúng vào DOM trên Web
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const existing = document.getElementById('mapbox-gl-css-cdn');
      if (!existing) {
        const link = document.createElement('link');
        link.id = 'mapbox-gl-css-cdn';
        link.rel = 'stylesheet';
        link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css';
        document.head.appendChild(link);
      }
    }
  }, []);

  const initialViewState = useMemo(
    () => ({
      longitude: initialRegion?.longitude || 108.2022,
      latitude: initialRegion?.latitude || 16.0544,
      zoom: 13,
    }),
    [initialRegion]
  );

  // Tự động căn chỉnh lại kích thước bản đồ khi mount và khi resize
  useEffect(() => {
    const handleResize = () => {
      mapRef.current?.resize();
    };

    const timer = setTimeout(handleResize, 300);
    const timer2 = setTimeout(handleResize, 1000);

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
    }

    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  useEffect(() => {
    if (centerCoordinate && mapRef.current) {
      mapRef.current.flyTo({
        center: [centerCoordinate.longitude, centerCoordinate.latitude],
        zoom: centerCoordinate.zoom || 14,
        duration: 1500,
      });
    }
  }, [centerCoordinate]);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: '#0B0F19',
      }}
    >
      <Map
        ref={mapRef}
        mapboxAccessToken={mapboxToken}
        initialViewState={initialViewState}
        style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        onLoad={(evt) => {
          evt.target.resize();
        }}
      >
        {markers.map((marker) => {
          const isSelf = !!marker.isSelf;
          const hasBeacon = !!marker.beacon;

          return (
            <Marker
              key={marker.id}
              longitude={marker.longitude}
              latitude={marker.latitude}
              onClick={(e) => {
                e.originalEvent?.stopPropagation();
                marker.onPress?.();
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                {/* 1. Thought Bubble (NOW Beacon) */}
                {hasBeacon && (
                  <div
                    style={{
                      backgroundColor: 'rgba(23, 27, 38, 0.95)',
                      border: '1.5px solid #FF4B72',
                      borderRadius: '16px',
                      padding: '4px 10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: 700,
                      marginBottom: '4px',
                      whiteSpace: 'nowrap',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                    }}
                  >
                    <span style={{ fontSize: '14px' }}>{marker.beacon?.emoji}</span>
                    <span>{marker.beacon?.text}</span>
                  </div>
                )}

                {/* 2. Avatar Pin with Glowing Border */}
                <div
                  style={{
                    position: 'relative',
                    width: '46px',
                    height: '46px',
                    borderRadius: '23px',
                    border: isSelf ? '3px solid #FF4B72' : '2.5px solid #38BDF8',
                    overflow: 'hidden',
                    backgroundColor: '#1E293B',
                    boxShadow: isSelf
                      ? '0 0 16px rgba(255, 75, 114, 0.6)'
                      : '0 0 12px rgba(56, 189, 248, 0.4)',
                  }}
                >
                  <img
                    src={
                      marker.avatar ||
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
                    }
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                    alt={marker.title}
                  />

                  {/* Jagat status badge */}
                  {marker.status && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '0',
                        right: '0',
                        backgroundColor: '#0F172A',
                        color: '#FFF',
                        fontSize: '9px',
                        fontWeight: 800,
                        padding: '1px 4px',
                        borderRadius: '6px',
                        border: '1px solid #334155',
                      }}
                    >
                      {marker.status.battery !== undefined
                        ? `🔋${marker.status.battery}%`
                        : '🟢'}
                    </div>
                  )}
                </div>

                {/* Name Label */}
                <span
                  style={{
                    color: '#E2E8F0',
                    fontSize: '11px',
                    fontWeight: 600,
                    marginTop: '2px',
                    textShadow: '0 1px 3px rgba(0,0,0,0.9)',
                  }}
                >
                  {marker.title}
                </span>
              </div>
            </Marker>
          );
        })}
      </Map>
    </div>
  );
};
