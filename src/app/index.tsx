import { Redirect } from "expo-router";

// Redirect root to the Fire tab (default landing page)
export default function Index() {
  return <Redirect href="/(tabs)/fire" />;
}
