import GameHeader from "@/components/GameHeader";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { Dimensions, Image, ImageBackground, Pressable, Text, View } from "react-native";

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

  // Adjusting cell width/height relative to screen dimensions
  const cellWidth = width / 4; // Divide screen width by 4 columns
  const cellHeight = height / 2; // Divide screen height by 2 rows
  const maxBalloonWidth = 100;
  const maxBalloonHeight = 150;

  for (let i = 0; i < count; i++) {
    const cell = getRandomCell();
    const col = cell % 4;
    const row = Math.floor(cell / 4);

    const left = col * cellWidth + padding + Math.random() * (cellWidth - 2 * padding - maxBalloonWidth);
    const top = row * cellHeight + padding + Math.random() * (cellHeight - 2 * padding - maxBalloonHeight);

    positions.push({
      top: `${(top / height) * 100}%`, // Percentage of screen height
      left: `${(left / width) * 100}%` // Percentage of screen width
    });
  }

  return positions;
};

const BalloonGame = () => {
  const [popped, setPopped] = useState(Array(8).fill(false));
  const [positions, setPositions] = useState(generateRandomPositions(8));

  function resetState() {
    setPopped(Array(8).fill(false));
    setPositions(generateRandomPositions(8));
  }

  // Reset game state when screen comes into focus
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

    const randomIndex =
      unpoppedIndexes[Math.floor(Math.random() * unpoppedIndexes.length)];

    const newPopped = [...popped];
    newPopped[randomIndex] = true;
    setPopped(newPopped);

    if(newPopped.every(isPopped => isPopped)) {
      setTimeout(() => {
        alert('You win!');
        resetState();
      }, 10);
    }
  };

  // Dynamic balloon size based on screen size
  const balloonWidth = Math.min(width / 6, 100);  // Set max width relative to screen width
  const balloonHeight = Math.min(height / 6, 150); // Set max height relative to screen height

  return (
    <View style={{ flex: 1 }}>
      <GameHeader style={{ position: 'absolute', top: 0, right: 0 }} />
      <ImageBackground
        source={require('@/assets/balloon_game/backgroundimage.png')}
        resizeMode="cover"
        style={{ flex: 1, width: '100%', height: '100%' }}
        onStartShouldSetResponder={() => true}
        onResponderRelease={handlePressAnywhere}
      >
        {positions.map((position, index) => (
          <Pressable
            key={index}
            onPress={handlePressAnywhere} // <- This makes balloons tappable!
            style={{
              position: 'absolute',
              top: position.top,
              left: position.left,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {popped[index] ? (
              <Text style={{ fontSize: 24, fontWeight: 'bold' }}>popped</Text>
            ) : (
              <Image
                source={require('@/assets/balloon_game/balloon.png')}
                style={{
                  width: balloonWidth,
                  height: balloonHeight,
                  borderRadius: 12,
                  resizeMode: 'contain'
                }}
              />
            )}
          </Pressable>
        ))}
      </ImageBackground>
    </View>
  );
};

export default BalloonGame;
