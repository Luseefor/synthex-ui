import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  DatePicker,
  Input,
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Slider,
  Switch,
  Textarea,
} from "synthex-ui/components";

export function FormShowcase() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Forms and input</CardTitle>
        <CardDescription>Core field primitives, structured input, and date selection from the real exported package.</CardDescription>
      </CardHeader>
      <CardContent className="preview-section-stack">
        <div className="preview-grid-2">
          <label className="preview-field"><Label>Name</Label><Input placeholder="Project name" /></label>
          <label className="preview-field"><Label>Workspace</Label><Select defaultValue="schematic" placeholder="Choose one"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="schematic">Schematic</SelectItem><SelectItem value="pcb">PCB</SelectItem></SelectContent></Select></label>
          <label className="preview-field preview-grid-span-2"><Label>Description</Label><Textarea placeholder="Describe the current workspace" /></label>
          <label className="preview-field"><Label>Release date</Label><DatePicker placeholder="Select date" /></label>
          <div className="preview-field"><Label>Verification</Label><InputOTP defaultValue="10"><InputOTPGroup><InputOTPSlot index={0} /><InputOTPSlot index={1} /><InputOTPSeparator /><InputOTPSlot index={2} /><InputOTPSlot index={3} /></InputOTPGroup></InputOTP></div>
        </div>
        <div className="preview-inline-row">
          <label className="preview-inline-control"><Checkbox defaultChecked /><span>Autosave</span></label>
          <label className="preview-inline-control"><Switch defaultChecked /><span>Inspector visible</span></label>
        </div>
        <div className="preview-field"><Label>Publish readiness</Label><Slider aria-label="Publish readiness" defaultValue={[72]} /></div>
        <div className="preview-inline-row"><Button>Save draft</Button><Button variant="outline">Preview</Button></div>
      </CardContent>
    </Card>
  );
}
