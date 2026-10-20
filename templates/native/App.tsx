import * as React from "react";
import { ScrollView, Text, View } from "react-native";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  ThemeProvider,
} from "synthex-ui/native";

// Static showcase: Button + Badge + Card + Dialog (Modal-backed on RN).
// DialogContent renders an RN Modal (transparent, fade) instead of the
// web Portal + Overlay. See dialog.native.tsx vs dialog.web.tsx.
export default function App() {
  return (
    <ThemeProvider>
      <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }}>
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 22, fontWeight: "700" }}>Synthex Native Demo</Text>
          <Badge testID="badge">moat: shared variants</Badge>
        </View>
        <Card testID="card">
          <CardHeader testID="card-header">
            <CardTitle testID="card-title">Same API, native render</CardTitle>
            <CardDescription>Card uses theme tokens, not CSS.</CardDescription>
          </CardHeader>
          <CardContent testID="card-content">
            <Button testID="button-primary">Primary action</Button>
            <Button testID="button-secondary" variant="secondary">
              Secondary
            </Button>
          </CardContent>
        </Card>
        <Dialog>
          <DialogTrigger testID="dialog-trigger">
            <Text>Open dialog</Text>
          </DialogTrigger>
          <DialogContent testID="dialog-content">
            <DialogTitle testID="dialog-title">Modal dialog</DialogTitle>
            <DialogDescription testID="dialog-description">
              Native DialogContent is an RN Modal. Dismiss via overlay or close.
            </DialogDescription>
          </DialogContent>
        </Dialog>
      </ScrollView>
    </ThemeProvider>
  );
}
