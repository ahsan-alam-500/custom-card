"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const layers = [
  "dresses", "heads", "hairstyles", "crowns",
  "beards", "eyes", "mouths", "noses"
];

// --- CardThumbnail Component ---
const CardThumbnail = ({ card, onClick, onRemove }) => (
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
    onClick={onClick}
  >
    {card.baseImage && (
      <img
        src={card.baseImage}
        alt="base"
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />
    )}
    {layers.map(layer =>
      card.selectedLayers[layer] && (
        <img
          key={layer}
          src={card.selectedLayers[layer]}
          alt={layer}
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
      )
    )}
    <button
      onClick={(e) => { e.stopPropagation(); onRemove(); }}
      style={{
        position: "absolute",
        top: "2px",
        right: "2px",
        backgroundColor: "red",
        color: "#fff",
        border: "none",
        borderRadius: "50%",
        width: "20px",
        height: "20px",
        cursor: "pointer",
        fontSize: "12px",
        lineHeight: "18px",
        textAlign: "center",
        padding: 0
      }}
    >
      ×
    </button>
  </div>
);

// --- CardSidebar Component ---
const CardSidebar = ({ cards, activeIndex, setActiveIndex, addCard, removeCard }) => (
  <div style={{ width: "140px", borderRight: "1px solid #ddd", paddingRight: "1rem" }}>
    <h3>Cards</h3>
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center" }}>
      {cards.map((card, idx) => (
        <div
          key={idx}
          style={{
            position: "relative",
            border: idx === activeIndex ? "2px solid #0070f3" : "1px solid #ccc",
            borderRadius: "6px",
            padding: "2px",
            transition: "border 0.2s"
          }}
        >
          <CardThumbnail
            card={card}
            onClick={() => setActiveIndex(idx)}
            onRemove={() => removeCard(idx)}
          />
        </div>
      ))}
    </div>
    <button
      onClick={addCard}
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
);

// --- CardPreview Component ---
const CardPreview = ({ activeCard }) => (
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
    {layers.map(layer =>
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
);

// --- LayerSelector Component ---
const LayerSelector = ({ product, activeCard, selectLayer }) => (
  <div>
    {layers.map(layer => (
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
                onClick={() => selectLayer(layer, url)}
              />
            );
          })}
        </div>
      </div>
    ))}
  </div>
);

// --- BaseSelector Component ---
const BaseSelector = ({ product, activeCard, selectBase }) => (
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
            onClick={() => selectBase(url)}
          />
        );
      })}
    </div>
  </div>
);

// --- Main Component ---
const ProductCustomizer = () => {
  const [product, setProduct] = useState(null);
  const [cards, setCards] = useState([]);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const router = useRouter();

  // Fetch product & load saved cards
  useEffect(() => {
    const fetchProduct = async () => {
      const res = await fetch(
        `https://momentocardgames.com/wp-json/wc/v3/products/87?consumer_key=${process.env.NEXT_PUBLIC_WC_KEY}&consumer_secret=${process.env.NEXT_PUBLIC_WC_SECRET}`
      );
      const data = await res.json();
      setProduct(data);

      const savedCards = localStorage.getItem("customCards");
      if (savedCards) {
        setCards(JSON.parse(savedCards));
        setActiveCardIndex(0);
        return;
      }

      const base = data.acf?.base_images?.[0]?.url || data.acf?.base_images?.[0];
      const initialLayers = {};
      layers.forEach(layer => {
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
    setCards(prev =>
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
    setCards(prev => prev.map((card, i) => i === activeCardIndex ? { ...card, baseImage: url } : card));
  };

  const addNewCard = () => {
    const base = product.acf?.base_images?.[0]?.url || product.acf?.base_images?.[0];
    const initialLayers = {};
    layers.forEach(layer => {
      if (layer === "beards") return;
      const items = product.acf?.[layer] || [];
      if (items.length > 0) initialLayers[layer] = items[0].url || items[0];
    });
    setCards([...cards, { baseImage: base, selectedLayers: initialLayers }]);
    setActiveCardIndex(cards.length);
  };

  const removeCard = (index) => {
    setCards(prev => {
      const updated = prev.filter((_, i) => i !== index);
      let newActive = activeCardIndex;
      if (updated.length === 0) newActive = 0;
      else if (index < activeCardIndex) newActive -= 1;
      else if (index === activeCardIndex) newActive = Math.min(activeCardIndex, updated.length - 1);
      setActiveCardIndex(newActive);
      return updated;
    });
  };

  const goToFinalView = () => {
    localStorage.setItem("customCards", JSON.stringify(cards));
    router.push("/pages/final");
  };

  return (
    <>
      <div style={{ display: "flex", gap: "2rem", padding: "1rem" }}>
        <CardSidebar
          cards={cards}
          activeIndex={activeCardIndex}
          setActiveIndex={setActiveCardIndex}
          addCard={addNewCard}
          removeCard={removeCard}
        />
        <div style={{ flex: 1, display: "flex", gap: "2rem" }}>
          <CardPreview activeCard={activeCard} />
          <div style={{ flex: 1, maxHeight: "800px", overflowY: "auto" }}>
            <h2>{product.name}</h2>
            <BaseSelector product={product} activeCard={activeCard} selectBase={selectBaseImage} />
            <LayerSelector product={product} activeCard={activeCard} selectLayer={selectLayerImage} />
          </div>
        </div>
      </div>
      <button
        onClick={goToFinalView}
        style={{
          marginTop: "1rem",
          padding: "10px 20px",
          backgroundColor: "#0070f3",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          width: "100%"
        }}
      >
        Finalize & View Cards
      </button>
    </>
  );
};

export default ProductCustomizer;
