import { GetFormattedShape, GetRandomShapes } from '@/components/game_components/ShapeGame/Shapes';
// import GameHeader from '@/components/GameHeader';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import Svg from 'react-native-svg';

// Screen dimensions
const { width, height } = Dimensions.get('window');

// Initial sizes of the shapes
const targetShapeInitialSize = 180;
const optionShapesInitialSize = 200;

// Get random shapes
const shapes = GetRandomShapes();
const targetShapeType = shapes[Math.floor(Math.random() * shapes.length)];

export default function ShapeGame() {
  // State to keep track of the selected index of shape options
  const [currentIndex, setCurrentIndex] = useState(0);

  // State to track if the index should keep changing or stop
  const [stopped, setStopped] = useState(false);
  const [shapes, setShapes] = useState(GetRandomShapes()); // State for new shapes
  const [targetShapeType, setTargetShapeType] = useState(shapes[Math.floor(Math.random() * shapes.length)]);

  // Reference for the target shape's position for animation
  const position = useRef(new Animated.ValueXY({
    x: width / 2 - targetShapeInitialSize / 2, // Initially at the center
    y: height / 3 - targetShapeInitialSize / 2 // Initial vertical position
  })).current;

  // Reference for the interval to stop or start changing shapes
  const intervalRef = useRef(null);

  // Shape options (positions of shapes at the bottom of the screen)
  const shapeOptions = [
    { type: shapes[0], x: width / 5, y: 650 },
    { type: shapes[1], x: width / 2, y: 650 },
    { type: shapes[2], x: 4 * width / 5, y: 650 }
  ];

  // Format the options to render them as SVG shapes
  const formattedOptions = shapeOptions.map((shape, index) =>
    GetFormattedShape({
      ...shape,
      size: optionShapesInitialSize,
      fill: 'none',
      stroke: currentIndex === index ? 'red' : 'white',
      strokeWidth: 20
    })
  );

  // Automatically cycles through shape options every 2 seconds
  useEffect(() => {
    if (!stopped) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % 3);
      }, 1500);
    }
    // Cleanup interval when stopped or component unmounts
    return () => clearInterval(intervalRef.current);
  }, [stopped]);

  // Function to animate target shape to the selected option when the screen is clicked
  const animateToSelected = () => {
    // Get the selected shape option
    const selected = shapeOptions[currentIndex];

    // Calculate the new position for the target shape
    const newX = selected.x - targetShapeInitialSize / 2;
    const newY = selected.y - targetShapeInitialSize / 2;

    // Animate the target shape's position
    Animated.timing(position, {
      toValue: { x: newX, y: newY },
      easing: Easing.linear,
      useNativeDriver: false // We are animating position, not transforms
    }).start();

    // Stop the index changes after screen click
    setStopped(true);

    // After animation completes, check if target and selected shapes match
    Animated.timing(position, {
      toValue: { x: newX, y: newY },
      duration: 300, // Duration of the animation
      easing: Easing.linear,
      useNativeDriver: false
    }).start(() => {
      if (targetShapeType === selected.type) {
        // If they match, restart the game with new shapes
        setTimeout(() => {
          restartGame(true);
        }, 300); // Add a little delay for visual feedback
      } else {
        // If not a match, reset the target shape position
        setTimeout(() => {
          restartGame(false);
        }, 200); // Add a little delay for visual feedback
      }
    });
  };

  const restartGame = (shouldResetShapes = false) => {
    if (shouldResetShapes) {
      const newShapes = GetRandomShapes();
      setShapes(newShapes);
      setTargetShapeType(newShapes[Math.floor(Math.random() * newShapes.length)]);
      setCurrentIndex(0);
    }
    position.setValue({ 
      x: width / 2 - targetShapeInitialSize / 2, 
      y: height / 3 - targetShapeInitialSize / 2 
    });
    setStopped(false);
  };

  return (
    <TouchableWithoutFeedback onPress={animateToSelected}>
      <View className="flex-1 bg-black">
        {/* Animated target shape */}
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
              stroke: 'white',
              fill: 'white'
            })}
          </Svg>
        </Animated.View>

        {/* Render shape options */}
        <Svg height={height} width={width} className="absolute top-0 left-0">
          {formattedOptions}
        </Svg>

        {/* Game Header */}
        {/* <GameHeader className="absolute top-0 right-0" /> */}
      </View>
    </TouchableWithoutFeedback>
  );
}

