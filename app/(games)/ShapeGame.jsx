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
  View
} from 'react-native';
import Svg from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const targetShapeInitialSize = 180;
const optionShapesInitialSize = 200;

export default function ShapeGame() {
  // tracks the current shape option
  const [currentIndex, setCurrentIndex] = useState(0);
  // tracks if index should be paused (while animations happen)
  const [stopped, setStopped] = useState(false);
  // All shape options
  const [shapes, setShapes] = useState(GetRandomShapes());
  // Target shape
  const [targetShapeType, setTargetShapeType] = useState(shapes[Math.floor(Math.random() * shapes.length)]);
  // If shape has been matched correctly
  const [shapesMatched, setShapesMatched] = useState(false);
  // 
  const [availableShapes, setAvailableShapes] = useState(shapes);
  const [sound, setSound] = useState();

  // og position of target shape 
  const position = useRef(new Animated.ValueXY({
    x: width / 2 - targetShapeInitialSize / 2,
    y: height / 3 - targetShapeInitialSize
  })).current;

  const matchedOpacity = useRef(new Animated.Value(0)).current;
  const intervalRef = useRef(null);

  // positions of shape options
  const optionPositions = [width / 5, width / 2, 4 * width / 5];

  // sets up dictionary with shape options
  const initialShapeMap = shapes.reduce((acc, shape, i) => {
    acc[shape] = {
      x: optionPositions[i],
      y: height - (optionShapesInitialSize + 50),
    };
    return acc;
  }, {});

  const formattedOptions = shapes.reduce((acc, shape, i) => {
    const { x, y } = initialShapeMap[shape];
    const isVisible = availableShapes.includes(shape);

    acc[shape] = {
      index: i,
      x,
      y,
      visible: isVisible,
      component: GetFormattedShape({
        type: shape,
        x,
        y,
        size: optionShapesInitialSize,
        fill: 'none',
        stroke:
          shapesMatched && targetShapeType === shape
            ? 'green'
            : currentIndex === i && isVisible
              ? 'red'
              : 'white',
        strokeWidth: 20,
        key: `shape-${i}`,
      }),
    };
    return acc;
  }, {});


  useEffect(() => {
    if (!stopped) {
      const visibleIndices = shapes
        .map((shape, i) => availableShapes.includes(shape) ? i : null)
        .filter(i => i !== null);

      intervalRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          const currentVisibleIndex = visibleIndices.indexOf(prev);
          const nextIndex = (currentVisibleIndex + 1) % visibleIndices.length;
          return visibleIndices[nextIndex];
        });
      }, 1500);
    }
    return () => clearInterval(intervalRef.current);
  }, [stopped, availableShapes]);

  // cheering sound
  const playCheeringSound = async () => {
    const { sound } = await Audio.Sound.createAsync(
      require('@/assets/audio/success_audio.mp3')
    );
    setSound(sound);
    await sound.playAsync();
  };

  const animateToSelected = () => {
    setStopped(true);

    // moves target shape to selected shape option
    const selectedShape = shapes[currentIndex];
    const selected = formattedOptions[selectedShape];
    const newX = selected.x - targetShapeInitialSize / 2;
    const newY = selected.y - targetShapeInitialSize / 2;

    Animated.timing(position, {
      toValue: { x: newX, y: newY },
      duration: 300,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(() => {
      // if match is made! Play sound and reset game
      if (targetShapeType === selectedShape) {
        setShapesMatched(true);
        playCheeringSound();
        setTimeout(() => {
          restartGame(true);
        }, 1500);
      } else {

        // const newAvailableShapes = availableShapes.filter(shape => shape !== selectedShape);
        setTimeout(() => {
          restartGame(false);
          setAvailableShapes(prev => prev.filter(shape => shape !== selectedShape));
        }, 200);
      }
    });
  };
  

  // reset game
  useFocusEffect(
    useCallback(() => {
      restartGame(true);
    }, [])
  );

  const restartGame = (shouldResetShapes = false) => {
    position.stopAnimation(() => {
      if (shouldResetShapes) {
        const newShapes = GetRandomShapes();
        setShapes(newShapes);
        setTargetShapeType(newShapes[Math.floor(Math.random() * newShapes.length)]);
        setAvailableShapes(newShapes);
        setCurrentIndex(0);
      }

      position.setValue({
        x: width / 2 - targetShapeInitialSize / 2,
        y: height / 3 - targetShapeInitialSize,
      });

      setStopped(false);
      setShapesMatched(false);
      // setMatchedIndex(null);
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <GameHeader />
      <TouchableWithoutFeedback onPress={animateToSelected}>
        <View>
          <Animated.View
            style={{
              position: 'absolute',
              transform: position.getTranslateTransform(),
            }}
          >
            <Svg height={targetShapeInitialSize} width={targetShapeInitialSize}>
              {GetFormattedShape({
                type: targetShapeType,
                x: targetShapeInitialSize / 2,
                y: targetShapeInitialSize / 2,
                size: targetShapeInitialSize,
                stroke: shapesMatched ? 'green' : 'white',
                fill: shapesMatched ? 'green' : 'white',
              })}
            </Svg>
          </Animated.View>

          <Svg height={height} width={width} className="absolute top-0 left-0">
            {Object.values(formattedOptions)
              .filter(opt => opt.visible)
              .map(opt => opt.component)}
          </Svg>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}


// const showMatchedPopup = () => {
//   matchedOpacity.setValue(0);
//   Animated.sequence([
//     Animated.timing(matchedOpacity, {
//       toValue: 1,
//       duration: 300,
//       useNativeDriver: true,
//     }),
//     Animated.delay(800),
//     Animated.timing(matchedOpacity, {
//       toValue: 0,
//       duration: 300,
//       useNativeDriver: true,
//     }),
//   ]).start();
// };
