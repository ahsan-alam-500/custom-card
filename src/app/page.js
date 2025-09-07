"use client";
import { useEffect, useState } from "react";

const layers = [
  "dresses",
  "heads",
  "hairstyles",
  "crowns",
  "beards",
  "eyes",
  "mouths",
  "noses"
];

const ProductCustomizer = () => {
  const [product, setProduct] = useState(null);
  const [cards, setCards] = useState([]); // All cards
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      const res = await fetch(
        `https://momentocardgames.com/wp-json/wc/v3/products/87?consumer_key=${process.env.NEXT_PUBLIC_WC_KEY}&consumer_secret=${process.env.NEXT_PUBLIC_WC_SECRET}`
      );
      const data = await res.json();
      setProduct(data);

      const base = data.acf?.base_images?.[0]?.url || data.acf?.base_images?.[0];
      const initialLayers = {};
      layers.forEach((layer) => {
        if (layer === "beards") return;
        const items = data.acf?.[layer] || [];
        if (items.length > 0) initialLayers[layer] = items[0].url || items[0];
      });

      setCards([{ baseImage: base, selectedLayers: initialLayers }]);
      setActiveCardIndex(0);
    };
    fetchProduct();
  }, []);

  if (!product) return <div>Loading...</div>;

  const activeCard = cards[activeCardIndex];

  const selectLayerImage = (layer, url) => {
    setCards((prev) =>
      prev.map((card, i) => {
        if (i !== activeCardIndex) return card;
        const updatedLayers = { ...card.selectedLayers };
        if (updatedLayers[layer] === url) delete updatedLayers[layer];
        else updatedLayers[layer] = url;
        return { ...card, selectedLayers: updatedLayers };
      })
    );
  };

  const selectBaseImage = (url) => {
    setCards((prev) =>
      prev.map((card, i) => (i === activeCardIndex ? { ...card, baseImage: url } : card))
    );
  };

  const addNewCard = () => {
    const base = product.acf?.base_images?.[0]?.url || product.acf?.base_images?.[0];
    const initialLayers = {};
    layers.forEach((layer) => {
      if (layer === "beards") return;
      const items = product.acf?.[layer] || [];
      if (items.length > 0) initialLayers[layer] = items[0].url || items[0];
    });
    setCards([...cards, { baseImage: base, selectedLayers: initialLayers }]);
    setActiveCardIndex(cards.length);
  };

  // Generate a small thumbnail of a card
  const CardThumbnail = ({ card }) => {
    return (
      <div
        style={{
          position: "relative",
          width: "80px",
          height: "160px",
          border: "1px solid #ccc",
          borderRadius: "6px",
          overflow: "hidden",
          cursor: "pointer",
          backgroundColor: "#fff"
        }}
      >
        {card.baseImage && (
          <img
            src={card.baseImage}
            alt="base"
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}
        {layers.map(
          (layer) =>
            card.selectedLayers[layer] && (
              <img
                key={layer}
                src={card.selectedLayers[layer]}
                alt={layer}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover"
                }}
              />
            )
        )}
      </div>
    );
  };

  return (
    <div style={{ display: "flex", gap: "2rem", padding: "1rem" }}>
      {/* Sidebar with thumbnails */}
      <div style={{ width: "120px", borderRight: "1px solid #ddd", paddingRight: "1rem" }}>
        <h3>Cards</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center" }}>
          {cards.map((card, idx) => (
            <div
              key={idx}
              onClick={() => setActiveCardIndex(idx)}
              style={{
                border: idx === activeCardIndex ? "2px solid #0070f3" : "1px solid #ccc",
                borderRadius: "6px",
                padding: "2px",
                transition: "border 0.2s"
              }}
            >
              <CardThumbnail card={card} />
            </div>
          ))}
        </div>
        <button
          onClick={addNewCard}
          style={{
            marginTop: "1rem",
            padding: "8px",
            backgroundColor: "#28a745",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Add New Card
        </button>
      </div>

      {/* Main Editor */}
      <div style={{ flex: 1, display: "flex", gap: "2rem" }}>
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
            backgroundColor: "#fff"
          }}
        >
          {activeCard?.baseImage && (
            <img
              src={activeCard.baseImage}
              alt="Base Card"
              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "contain" }}
            />
          )}
          {layers.map(
            (layer) =>
              activeCard?.selectedLayers[layer] && (
                <div key={layer}>
                  <img
                    src={activeCard.selectedLayers[layer]}
                    alt={layer}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: "55%",
                      height: "50%",
                      objectFit: "contain",
                      paddingTop: "30px"
                    }}
                  />
                  <img
                    src={activeCard.selectedLayers[layer]}
                    alt={`${layer}-mirrored`}
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: "50%",
                      transform: "translateX(-50%) scaleY(-1)",
                      width: "55%",
                      height: "50%",
                      objectFit: "contain",
                      paddingTop: "30px"
                    }}
                  />
                </div>
              )
          )}
        </div>

        {/* Controls */}
        <div style={{ flex: 1, maxHeight: "800px", overflowY: "auto" }}>
          <h2>{product.name}</h2>

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
                      border: activeCard?.baseImage === url ? "2px solid #0070f3" : "1px solid #ccc",
                      cursor: "pointer"
                    }}
                    onClick={() => selectBaseImage(url)}
                  />
                );
              })}
            </div>
          </div>

          {/* Layer selectors */}
          {layers.map((layer) => (
            <div key={layer} style={{ marginBottom: "1.5rem" }}>
              <h3 style={{ textTransform: "capitalize" }}>{layer.replace("_", " ")}</h3>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {(product.acf?.[layer] || []).map((image, idx) => {
                  const url = image.url || image;
                  const isSelected = activeCard?.selectedLayers[layer] === url;
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
                        opacity: isSelected ? 1 : 0.7
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
    </div>
  );
};

export default ProductCustomizer;
