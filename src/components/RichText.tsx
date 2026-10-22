import { StyleProp, Text, TextStyle } from 'react-native';
import { splitBold } from '../utils/markdown';

export default function RichText({
  text,
  style,
}: {
  text: string;
  style?: StyleProp<TextStyle>;
}) {
  return (
    <Text style={style}>
      {splitBold(text).map((part, i) =>
        part.bold ? (
          <Text key={i} style={{ fontFamily: 'CourierPrime_700Bold' }}>
            {part.text}
          </Text>
        ) : (
          part.text
        )
      )}
    </Text>
  );
}
