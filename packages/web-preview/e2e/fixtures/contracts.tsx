import { useEffect, useState } from "react";
import {
  Badge, Button, Card, H2, Checkbox, DirectionProvider, Dialog, DialogClose, DialogContent,
  DialogDescription, DialogTitle, DialogTrigger, Form, FormControl,
  FormDescription, FormField, FormItem, FormLabel, FormMessage, Input,
  RadioGroup, RadioGroupItem, Switch, Tabs, TabsContent, TabsList, TabsTrigger,
  Toast, ToastAction, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport,
} from "synthex-ui/components";
import { ThemeProvider } from "synthex-ui/theme";
import { Icon } from "synthex-ui/icons";
import type { AccentPresetName } from "../../../ui/src/_shared/types";
import "./contracts.css";

const accents: AccentPresetName[] = ["blue", "emerald", "violet", "amber", "rose", "steel", "stone", "bronze", "mulberry"];

export function Contracts() {
  const [accent, setAccent] = useState<AccentPresetName>("steel");
  const [mode, setMode] = useState<"light" | "dark">("light");
  const [direction, setDirection] = useState<"ltr" | "rtl">("rtl");
  const [activations, setActivations] = useState(0);
  const [submitted, setSubmitted] = useState("");
  const [toastOpen, setToastOpen] = useState(false);
  useEffect(() => { document.documentElement.dataset.hydrated = "true"; }, []);
  return <ThemeProvider mode={mode} accentPreset={accent}>
    <main>
      <h1>Component contract checks</h1>
      <section aria-label="Theme controls">
        <label>Accent<select aria-label="Accent" value={accent} onChange={(event) => setAccent(event.target.value as AccentPresetName)}>{accents.map((name) => <option key={name}>{name}</option>)}</select></label>
        <label>Mode<select aria-label="Mode" value={mode} onChange={(event) => setMode(event.target.value as "light" | "dark")}><option>light</option><option>dark</option></select></label>
        <Button data-testid="brand"><Icon name="add" />Primary action</Button>
        <Button variant="destructive" data-testid="destructive"><Icon name="close" />Destructive action</Button>
        <Badge variant="destructive" data-testid="destructive-badge">Destructive badge</Badge>
        <span data-testid="explicit-icon"><Icon name="check" color="#0055aa" /></span>
      </section>
      <section aria-label="Semantic borders">
        <Card data-testid="default-card">Default card</Card>
        <Badge variant="outline" data-testid="outline-badge">Outline badge</Badge>
        <H2 data-testid="bordered-heading">Section heading</H2>
        <Card variant="muted" data-testid="transparent-card">Muted card</Card>
        <Card className="border-destructive" data-testid="custom-border-card">Custom border</Card>
      </section>
      <section aria-label="Button composition">
        <Button asChild disabled onClick={() => setActivations((value) => value + 1)}><a href="#unexpected" onClick={() => setActivations((value) => value + 1)}>Disabled link</a></Button>
        <Button asChild><a href="#enabled">Enabled link</a></Button>
        <output aria-label="Activation count">{activations}</output>
      </section>
      <section aria-label="Directional navigation">
        <label>Direction<select aria-label="Direction" value={direction} onChange={(event) => setDirection(event.target.value as "ltr" | "rtl")}><option>ltr</option><option>rtl</option></select></label>
        <DirectionProvider dir={direction}>
          <Tabs defaultValue="one">
            <TabsList aria-label="Workspace tabs"><TabsTrigger value="one">First tab</TabsTrigger><TabsTrigger value="skip" disabled>Disabled tab</TabsTrigger><TabsTrigger value="two">Second tab</TabsTrigger></TabsList>
            <TabsContent value="one">First panel</TabsContent><TabsContent value="two">Second panel</TabsContent>
          </Tabs>
          <RadioGroup defaultValue="first" orientation="horizontal" aria-label="Options">
            <RadioGroupItem value="first">First option</RadioGroupItem><RadioGroupItem value="skip" disabled>Disabled option</RadioGroupItem><RadioGroupItem value="second">Second option</RadioGroupItem>
          </RadioGroup>
        </DirectionProvider>
      </section>
      <section aria-label="Native form behavior">
        <Form onSubmit={(event) => { event.preventDefault(); setSubmitted(JSON.stringify(Object.fromEntries(new FormData(event.currentTarget)))); }}>
          <label>Account<Input name="account" defaultValue="Ada" required /></label>
          <label><Checkbox name="subscribed" value="yes" defaultChecked />Subscribed</label>
          <label><Switch name="notifications" value="on" defaultChecked />Notifications</label>
          <Button type="submit">Submit form</Button><Button type="reset">Reset form</Button>
        </Form>
        <output aria-label="Form payload">{submitted}</output>
        <FormField name="email" description="Release updates only." error="Enter a valid email.">
          <FormItem><FormLabel>Email</FormLabel><FormControl aria-describedby="external-help"><Input /></FormControl><FormDescription /><FormMessage /><p id="external-help">External field hint.</p></FormItem>
        </FormField>
      </section>
      <section aria-label="Overlay focus">
        <Dialog><DialogTrigger asChild><Button>Open dialog</Button></DialogTrigger><DialogContent hideClose>
          <DialogTitle>Focus check</DialogTitle><DialogDescription>Keyboard focus stays inside until the dialog closes.</DialogDescription>
          <Button>First dialog action</Button><DialogClose asChild><Button>Last dialog action</Button></DialogClose>
        </DialogContent></Dialog>
      </section>
      <section aria-label="Toast feedback">
        <ToastProvider>
          <Button onClick={() => setToastOpen(true)}>Show critical toast</Button>
          <Toast open={toastOpen} onOpenChange={setToastOpen} duration={Infinity} variant="destructive">
            <div><ToastTitle>Publish failed</ToastTitle><ToastDescription>Retry the deployment.</ToastDescription></div>
            <ToastAction altText="Retry deployment">Retry</ToastAction><ToastClose />
          </Toast>
          <ToastViewport />
        </ToastProvider>
      </section>
    </main>
  </ThemeProvider>;
}
