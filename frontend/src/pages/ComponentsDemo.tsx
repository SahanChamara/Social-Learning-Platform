import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from "../components/ui";
import { toast } from "../hooks/useToast";
import { Heart, Loader2, Mail } from "lucide-react";

export default function ComponentsDemo() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            UI Components Demo
          </h1>
          <p className="mt-2 text-gray-600">
            Testing all base UI components for the Social Learning Platform
          </p>
        </div>

        {/* Button Variants */}
        <Card>
          <CardHeader>
            <CardTitle>Button Component</CardTitle>
            <CardDescription>
              Different button variants and sizes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button>Default</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon">
                <Heart className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button disabled>Disabled</Button>
              <Button>
                <Mail className="mr-2 h-4 w-4" />
                With Icon
              </Button>
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Input Component */}
        <Card>
          <CardHeader>
            <CardTitle>Input Component</CardTitle>
            <CardDescription>Form input with label and error state</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="error-input">Input with Error</Label>
              <Input
                id="error-input"
                error="This field is required"
                placeholder="This has an error"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="disabled-input">Disabled Input</Label>
              <Input
                id="disabled-input"
                disabled
                placeholder="This is disabled"
              />
            </div>
          </CardContent>
        </Card>

        {/* Card Component */}
        <Card>
          <CardHeader>
            <CardTitle>Card Component</CardTitle>
            <CardDescription>
              Card with header, content, and footer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              This is the card content area. It can contain any content, such
              as text, images, or other components.
            </p>
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="ghost">Cancel</Button>
            <Button>Save Changes</Button>
          </CardFooter>
        </Card>

        {/* Toast Component */}
        <Card>
          <CardHeader>
            <CardTitle>Toast Component</CardTitle>
            <CardDescription>
              Click buttons to trigger toast notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  toast({
                    title: "Default Toast",
                    description: "This is a default toast notification.",
                  });
                }}
              >
                Show Default
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  toast({
                    variant: "success",
                    title: "Success!",
                    description: "Your changes have been saved successfully.",
                  });
                }}
              >
                Show Success
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  toast({
                    variant: "destructive",
                    title: "Error!",
                    description: "Something went wrong. Please try again.",
                  });
                }}
              >
                Show Error
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  toast({
                    variant: "warning",
                    title: "Warning",
                    description: "Please review your changes before saving.",
                  });
                }}
              >
                Show Warning
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
