import * as React from "react";
import { ScrollView, Text, View } from "react-native";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  ThemeProvider,
} from "synthex-ui/native";

// Starter screen: Button + Dialog inside ThemeProvider.
// The bundler resolves `synthex-ui/native` through the `react-native`
// export condition; DialogContent renders an RN Modal (transparent, fade).
export default function App() {
  const [count, setCount] = React.useState(0);

  return (
    <ThemeProvider>
      <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }}>
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 22, fontWeight: "700" }}>
            Synthex Expo Starter
          </Text>
          <Text>Pressed {count} times</Text>
        </View>
        <Button testID="button-primary" onPress={() => setCount((c) => c + 1)}>
          Primary action
        </Button>
        <Button
          testID="button-secondary"
          variant="secondary"
          onPress={() => setCount(0)}
        >
          Reset
        </Button>
        <Dialog>
          <DialogTrigger testID="dialog-trigger">
            <Text>Open dialog</Text>
          </DialogTrigger>
          <DialogContent testID="dialog-content">
            <DialogTitle testID="dialog-title">Native dialog</DialogTitle>
            <DialogDescription testID="dialog-description">
              Native DialogContent renders inside an RN Modal. Dismiss via the
              overlay or the close control.
            </DialogDescription>
          </DialogContent>
        </Dialog>
      </ScrollView>
    </ThemeProvider>
  );
}
