"use client";
import { useEffect, useState } from "react";

const layers = [
  "dresses",
  "heads",
  "hairstyles",
  "crowns",
  "beards", // starts unselected
  "eyes",
  "mouths",
  "noses"
];

const ProductCustomizer = () => {
  const [product, setProduct] = useState(null);
  const [selectedLayers, setSelectedLayers] = useState({});
  const [baseImage, setBaseImage] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      const res = await fetch(
        "https://momentocardgames.com/wp-json/wc/v3/products/87?consumer_key=ck_d7aa9d5d1cdec3b32c2c9ec878114e0b8b6cba1d&consumer_secret=cs_54cc2cfa5d2e6ee5bf221e42f8bca846cd8d50d1"
      );
      const data = await res.json();
      setProduct(data);

      const base = data.acf?.base_images?.[0];
      if (base) setBaseImage(base.url || base);

      // Initialize first item of each layer except 'beards'
      const initialLayers = {};
      layers.forEach((layer) => {
        if (layer === "beards") return; // skip beards
        const items = data.acf?.[layer] || [];
        if (items.length > 0) {
          initialLayers[layer] = items[0].url || items[0];
        }
      });
      setSelectedLayers(initialLayers);
    };
    fetchProduct();
  }, []);

  if (!product) return <div>Loading...</div>;

  const selectLayerImage = (layer, url) => {
    setSelectedLayers((prev) => {
      // Deselect if clicked again
      if (prev[layer] === url) {
        const updated = { ...prev };
        delete updated[layer];
        return updated;
      }
      return { ...prev, [layer]: url };
    });
  };

  return (
    <div style={{ display: "flex", gap: "2rem", padding: "1rem" }}>
      {/* Preview */}
      <div
        style={{
          flex: 1,
          position: "relative",
          width: "400px",
          height: "800px",
          border: "1px solid #ddd",
          borderRadius: "12px",
          overflow: "hidden",
          backgroundColor: "#fff",
        }}
      >
        {/* Base image */}
        {baseImage && (
          <img
            src={baseImage}
            alt="Base Card"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        )}

        {/* Other layers */}
        {layers.map(
          (layer) =>
            selectedLayers[layer] && (
              <div key={layer}>
                {/* Top half */}
                <img
                  src={selectedLayers[layer]}
                  alt={layer}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "55%",
                    height: "50%",
                    objectFit: "contain",
                    paddingTop: "30px",
                  }}
                />
                {/* Bottom half (mirrored) */}
                <img
                  src={selectedLayers[layer]}
                  alt={`${layer}-mirrored`}
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: "50%",
                    transform: "translateX(-50%) scaleY(-1)",
                    width: "55%",
                    height: "50%",
                    objectFit: "contain",
                    paddingTop: "30px",
                  }}
                />
              </div>
            )
        )}
      </div>

      {/* Controls */}
      <div style={{ flex: 1, maxHeight: "800px", overflowY: "auto" }}>
        <h2>{product.name}</h2>
        <div dangerouslySetInnerHTML={{ __html: product.description }} />
        <div dangerouslySetInnerHTML={{ __html: product.price_html }} />

        {/* Base selector */}
        <div style={{ marginBottom: "1.5rem" }}>
          <h3>Base Image</h3>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {(product.acf?.base_images || []).map((image, idx) => {
              const url = image.url || image;
              return (
                <img
                  key={idx}
                  src={url}
                  alt={`Base ${idx + 1}`}
                  style={{
                    width: "60px",
                    height: "80px",
                    objectFit: "cover",
                    border:
                      baseImage === url ? "2px solid #0070f3" : "1px solid #ccc",
                    cursor: "pointer",
                  }}
                  onClick={() => setBaseImage(url)}
                />
              );
            })}
          </div>
        </div>

        {/* Layer selectors */}
        {layers.map((layer) => (
          <div key={layer} style={{ marginBottom: "1.5rem" }}>
            <h3 style={{ textTransform: "capitalize" }}>
              {layer.replace("_", " ")}
            </h3>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {(product.acf?.[layer] || []).map((image, idx) => {
                const url = image.url || image;
                const isSelected = selectedLayers[layer] === url;
                return (
                  <img
                    key={idx}
                    src={url}
                    alt={`${layer} ${idx + 1}`}
                    style={{
                      width: "60px",
                      height: "50px",
                      objectFit: "cover",
                      border: isSelected ? "2px solid #0070f3" : "1px solid #ccc",
                      cursor: "pointer",
                      opacity: isSelected ? 1 : 0.7,
                    }}
                    onClick={() => selectLayerImage(layer, url)}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductCustomizer;
