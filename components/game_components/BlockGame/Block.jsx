import { View } from 'react-native';

export default function Block({ x, y, size, fillColor, strokeColor }) {
  return (
    <View style={{
      position: 'absolute',
      bottom: y,
      left: x,
      width: size,
      height: size,
      backgroundColor: fillColor,
      borderWidth: 5,
      borderColor: strokeColor,
    }} />
  );
}