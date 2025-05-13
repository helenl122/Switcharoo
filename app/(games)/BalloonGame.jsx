import GameHeader from "@/components/GameHeader";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { Dimensions, Image, ImageBackground, Pressable, View } from "react-native";

const { width, height } = Dimensions.get("window");

const generateRandomPositions = (count) => {
  const cellCount = 8;
  const padding = 20;
  const usedCells = new Set();

  const getRandomCell = () => {
    let cell;
    do {
      cell = Math.floor(Math.random() * cellCount);
    } while (usedCells.has(cell));
    usedCells.add(cell);
    return cell;
  };

  const positions = [];
  const cellWidth = width / 4;
  const cellHeight = height / 2;
  const maxBalloonWidth = 100;
  const maxBalloonHeight = 150;

  for (let i = 0; i < count; i++) {
    const cell = getRandomCell();
    const col = cell % 4;
    const row = Math.floor(cell / 4);

    const left = col * cellWidth + padding + Math.random() * (cellWidth - 2 * padding - maxBalloonWidth);
    const top = row * cellHeight + padding + Math.random() * (cellHeight - 2 * padding - maxBalloonHeight);

    positions.push({
      top: `${(top / height) * 100}%`,
      left: `${(left / width) * 100}%`
    });
  }

  return positions;
};

const BalloonGame = () => {
  const [popped, setPopped] = useState(Array(8).fill(false));
  const [exploding, setExploding] = useState(Array(8).fill(false));
  const [gifKeys, setGifKeys] = useState(Array(8).fill(0));
  const [positions, setPositions] = useState(generateRandomPositions(8));

  function resetState() {
    setPopped(Array(8).fill(false));
    setExploding(Array(8).fill(false));
    setGifKeys(Array(8).fill(0));
    setPositions(generateRandomPositions(8));
  }

  useFocusEffect(
    useCallback(() => {
      resetState();
    }, [])
  );

  const handlePressAnywhere = () => {
    const unpoppedIndexes = popped
      .map((isPopped, index) => (!isPopped ? index : null))
      .filter(index => index !== null);

    if (unpoppedIndexes.length === 0) {
      return;
    }

    const randomIndex = unpoppedIndexes[Math.floor(Math.random() * unpoppedIndexes.length)];

    // Update exploding and gifKeys using functional updates to prevent stale state issues
    setExploding(prev => {
      const newExploding = [...prev];
      newExploding[randomIndex] = true;
      return newExploding;
    });

    setGifKeys(prev => {
      const newKeys = [...prev];
      newKeys[randomIndex] = Date.now(); // or Math.random();
      return newKeys;
    });

    setPopped(prev => {
      const newPopped = [...prev];
      newPopped[randomIndex] = true;
      return newPopped;
    });

    setTimeout(() => {
      setExploding(prev => {
        const updated = [...prev];
        updated[randomIndex] = false;
        return updated;
      });
    }, 600);

    if (popped.filter(Boolean).length + 1 === popped.length) {
      setTimeout(() => {
        alert("You win!");
        resetState();
      }, 1000);
    }
  };

  const balloonWidth = Math.min(width / 6, 100);
  const balloonHeight = Math.min(height / 6, 150);

  return (
    <View style={{ flex: 1 }}>
      <GameHeader style={{ position: "absolute", top: 0, right: 0 }} />
      <ImageBackground
        source={require("@/assets/balloon_game/backgroundimage.png")}
        resizeMode="cover"
        style={{ flex: 1, width: "100%", height: "100%" }}
        onStartShouldSetResponder={() => true}
        onResponderRelease={handlePressAnywhere}
      >
        {positions.map((position, index) => (
          <Pressable
            key={index}
            onPress={handlePressAnywhere}
            style={{
              position: "absolute",
              top: position.top,
              left: position.left,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {exploding[index] ? (
              <Image
                key={gifKeys[index]} // Force restart GIF
                source={require("@/assets/balloon_game/explode.gif")}
                style={{
                  width: balloonWidth,
                  height: balloonHeight,
                  resizeMode: "contain",
                }}
              />
            ) : !popped[index] ? (
              <Image
                source={require("@/assets/balloon_game/balloon.png")}
                style={{
                  width: balloonWidth,
                  height: balloonHeight,
                  borderRadius: 12,
                  resizeMode: "contain",
                }}
              />
            ) : null}
          </Pressable>
        ))}
      </ImageBackground>
    </View>
  );
};

export default BalloonGame;
