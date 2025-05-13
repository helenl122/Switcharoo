import { GetFormattedShape, GetRandomShapes } from '@/components/game_components/ShapeGame/Shapes';
import GameHeader from '@/components/GameHeader';
import { useFocusEffect } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  SafeAreaView,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Svg, { G } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const targetShapeInitialSize = 180;
const optionShapesInitialSize = 200;

const AnimatedG = Animated.createAnimatedComponent(G);

export default function ShapeGame() {
  const [shapes, setShapes] = useState(GetRandomShapes());
  const [targetShapeType, setTargetShapeType] = useState(
    shapes[Math.floor(Math.random() * shapes.length)]
  );
  const [availableShapes, setAvailableShapes] = useState(shapes);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stopped, setStopped] = useState(false);
  const [shapesMatched, setShapesMatched] = useState(false);
  const [sound, setSound] = useState();

  const position = useRef(
    new Animated.ValueXY({
      x: width / 2 - targetShapeInitialSize / 2,
      y: height / 3 - targetShapeInitialSize,
    })
  ).current;

  const targetShake = useRef(new Animated.Value(0)).current;
  const optionShake = useRef(new Animated.Value(0)).current;
  const intervalRef = useRef(null);

  const optionPositions = [width / 5, width / 2, (4 * width) / 5];

  // Cycle between visible shapes
  useEffect(() => {
    if (!stopped) {
      const visibleIndices = shapes
        .map((shape, i) => (availableShapes.includes(shape) ? i : null))
        .filter((i) => i !== null);

      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          const currentVisibleIndex = visibleIndices.indexOf(prev);
          const nextIndex = (currentVisibleIndex + 1) % visibleIndices.length;
          return visibleIndices[nextIndex];
        });
      }, 1500);
    }

    return () => clearInterval(intervalRef.current);
  }, [stopped, availableShapes]);

  // Play cheering sound
  const playCheeringSound = async () => {
    const { sound } = await Audio.Sound.createAsync(
      require('@/assets/audio/success_audio.mp3')
    );
    setSound(sound);
    await sound.playAsync();
  };

  // Shake animation
  const shakeAnimation = (animatedValue) => {
    return Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 6,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: -6,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]);
  };

  const animateToSelected = () => {
  setStopped(true);
  const selectedShape = shapes[currentIndex];
  const x = optionPositions[currentIndex];
  const y = height - (optionShapesInitialSize + 50);

  Animated.timing(position, {
    toValue: {
      x: x - targetShapeInitialSize / 2,
      y: y - targetShapeInitialSize / 2,
    },
    duration: 300,
    easing: Easing.linear,
    useNativeDriver: true,
  }).start(() => {
    if (selectedShape === targetShapeType) {
      setShapesMatched(true);
      playCheeringSound();
      setTimeout(() => restartGame(true), 1500);
    } else {
      Animated.parallel([
        shakeAnimation(targetShake),
        shakeAnimation(optionShake),
      ]).start(() => {
        setTimeout(() => {
          setAvailableShapes((prev) =>
            prev.filter((shape) => shape !== selectedShape)
          );

          // Automatically highlight the next available shape
          setCurrentIndex((prev) => {
            const currentShape = shapes[prev];
            const nextIndex = availableShapes.indexOf(currentShape) + 1;
            return nextIndex < availableShapes.length ? nextIndex : 0;
          });

          restartGame(false);
        }, 200);
      });
    }
  });
};


  // const animateToSelected = () => {
  //   setStopped(true);
  //   const selectedShape = shapes[currentIndex];
  //   const x = optionPositions[currentIndex];
  //   const y = height - (optionShapesInitialSize + 50);

  //   Animated.timing(position, {
  //     toValue: {
  //       x: x - targetShapeInitialSize / 2,
  //       y: y - targetShapeInitialSize / 2,
  //     },
  //     duration: 300,
  //     easing: Easing.linear,
  //     useNativeDriver: true,
  //   }).start(() => {
  //     if (selectedShape === targetShapeType) {
  //       setShapesMatched(true);
  //       playCheeringSound();
  //       setTimeout(() => restartGame(true), 1500);
  //     } else {
  //       Animated.parallel([
  //         shakeAnimation(targetShake),
  //         shakeAnimation(optionShake),
  //       ]).start(() => {
  //         setTimeout(() => {
  //           setAvailableShapes((prev) =>
  //             prev.filter((shape) => shape !== selectedShape)
  //           );
  //           restartGame(false);
  //         }, 200);
  //       });
  //     }
  //   });
  // };

  // Restart on screen focus
  useFocusEffect(
    useCallback(() => {
      restartGame(true);
    }, [])
  );

  const restartGame = (resetShapes = false) => {
    position.stopAnimation(() => {
      if (resetShapes) {
        const newShapes = GetRandomShapes();
        setShapes(newShapes);
        setAvailableShapes(newShapes);
        setTargetShapeType(
          newShapes[Math.floor(Math.random() * newShapes.length)]
        );
        setCurrentIndex(0);
      }

      position.setValue({
        x: width / 2 - targetShapeInitialSize / 2,
        y: height / 3 - targetShapeInitialSize,
      });

      targetShake.setValue(0);
      optionShake.setValue(0);
      setShapesMatched(false);
      setStopped(false);
    });
  };

  const renderShapeOptions = () => {
    return shapes.map((shape, i) => {
      if (!availableShapes.includes(shape)) return null;

      const x = optionPositions[i];
      const y = height - (optionShapesInitialSize + 50);
      const isSelected = i === currentIndex;
      const isCorrect = shape === targetShapeType;

      return (
        <AnimatedG
          key={`shape-${i}`}
          transform={
            isSelected && !shapesMatched && !isCorrect
              ? optionShake.interpolate({
                  inputRange: [-10, 10],
                  outputRange: [`translate(-10, 0)`, `translate(10, 0)`],
                })
              : `translate(0, 0)`
          }
        >
          {GetFormattedShape({
            type: shape,
            x,
            y,
            size: optionShapesInitialSize,
            fill: 'none',
            stroke:
              shapesMatched && isCorrect
                ? 'green'
                : isSelected
                ? 'red'
                : 'white',
            strokeWidth: 20,
          })}
        </AnimatedG>
      );
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <GameHeader />
      <TouchableWithoutFeedback onPress={animateToSelected}>
        <View className="flex-1">
          <Animated.View
            style={{
              position: 'absolute',
              transform: [
                ...position.getTranslateTransform(),
                { translateX: targetShake },
              ],
            }}
          >
            <Svg height={targetShapeInitialSize} width={targetShapeInitialSize}>
              {GetFormattedShape({
                type: targetShapeType,
                x: targetShapeInitialSize / 2,
                y: targetShapeInitialSize / 2,
                size: targetShapeInitialSize,
                fill: shapesMatched ? 'green' : 'white',
                stroke: shapesMatched ? 'green' : 'white',
              })}
            </Svg>
          </Animated.View>

          <Svg height={height} width={width} className="absolute top-0 left-0">
            {renderShapeOptions()}
          </Svg>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
