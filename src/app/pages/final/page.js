"use client";
import { useRouter } from "next/navigation";
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



const FinalCardsPage = () => {
    const [cards, setCards] = useState([]);

    useEffect(() => {
        const saved = localStorage.getItem("customCards");
        if (saved) setCards(JSON.parse(saved));
    }, []);

    const router = useRouter();

    const previousPage = () => {
        localStorage.setItem("customCards", JSON.stringify(cards));
        router.push("/");
    };

    if (!cards.length) return <div>No cards found.</div>;

    return (
        <div style={{ padding: "2rem" }}>
            <h1>Final Cards</h1>
            <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
                {cards.map((card, idx) => (
                    <div
                        key={idx}
                        style={{
                            position: "relative",
                            width: "200px",
                            height: "400px",
                            border: "1px solid #ccc",
                            borderRadius: "8px",
                            overflow: "hidden",
                            backgroundColor: "#fff",
                            marginBottom: "1rem"
                        }}
                    >
                        {/* Base image */}
                        {card.baseImage && (
                            <img
                                src={card.baseImage}
                                alt="Base Card"
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "contain"
                                }}
                            />
                        )}

                        {/* Layers */}
                        {layers.map(
                            (layer) =>
                                card.selectedLayers[layer] && (
                                    <div key={layer}>
                                        {/* Top half */}
                                        <img
                                            src={card.selectedLayers[layer]}
                                            alt={layer}
                                            style={{
                                                position: "absolute",
                                                top: 0,
                                                left: "50%",
                                                transform: "translateX(-50%)",
                                                width: "55%",
                                                height: "60%",
                                                objectFit: "contain",
                                                paddingTop: "55px"
                                            }}
                                        />
                                        {/* Bottom half mirrored */}
                                        <img
                                            src={card.selectedLayers[layer]}
                                            alt={`${layer}-mirrored`}
                                            style={{
                                                position: "absolute",
                                                bottom: 0,
                                                left: "50%",
                                                transform: "translateX(-50%) scaleY(-1)",
                                                width: "55%",
                                                height: "60%",
                                                objectFit: "contain",
                                                paddingTop: "55px"
                                            }}
                                        />
                                    </div>
                                )
                        )}
                    </div>

                ))}
            </div>
            <button
                onClick={previousPage}
                style={{
                    marginTop: "1rem",
                    padding: "10px 20px",
                    backgroundColor: "#0070f3",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer"
                }}
            >
                previous page
            </button>
        </div>
    );
};

export default FinalCardsPage;
