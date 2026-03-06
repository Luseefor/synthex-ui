import {
  Button,
  Checkbox,
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
  DatePicker,
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  InputGroup,
  InputGroupAddon,
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
  Label,
  NativeSelect,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Slider,
  Switch,
  Textarea,
  Toggle,
  ToggleGroup,
  ToggleGroupItem,
} from "synthex-ui/components";
import { ShowcaseSection } from "./ShowcaseSection";

export function FormShowcase() {
  return (
    <ShowcaseSection
      title="Forms and input"
      description="Core field primitives, structured input, validation wrappers, and searchable selection from the real exported package."
      includes={["Input", "Select", "Combobox", "DatePicker", "InputOTP", "Form", "Slider"]}
    >
      <div className="preview-section-stack">
        <div className="preview-grid-2">
          <label className="preview-field"><Label>Name</Label><Input placeholder="Project name" /></label>
          <label className="preview-field"><Label>Workspace</Label><Select defaultValue="schematic" placeholder="Choose one"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="schematic">Schematic</SelectItem><SelectItem value="pcb">PCB</SelectItem></SelectContent></Select></label>
          <div className="preview-field"><Label>Assignee</Label><Combobox defaultValue="rijan" placeholder="Select owner"><ComboboxTrigger><ComboboxValue /></ComboboxTrigger><ComboboxContent><ComboboxInput /><ComboboxList><ComboboxItem value="rijan">Rijan</ComboboxItem><ComboboxItem value="luseefor">Luseefor</ComboboxItem><ComboboxItem value="release-bot">Release bot</ComboboxItem><ComboboxEmpty>No matching owner.</ComboboxEmpty></ComboboxList></ComboboxContent></Combobox></div>
          <label className="preview-field preview-grid-span-2"><Label>Description</Label><Textarea placeholder="Describe the current workspace" /></label>
          <label className="preview-field"><Label>Release date</Label><DatePicker placeholder="Select date" /></label>
          <div className="preview-field"><Label>Verification</Label><div className="preview-x-scroll preview-x-scroll-inline"><InputOTP defaultValue="10"><InputOTPGroup><InputOTPSlot index={0} /><InputOTPSlot index={1} /><InputOTPSeparator /><InputOTPSlot index={2} /><InputOTPSlot index={3} /></InputOTPGroup></InputOTP></div></div>
          <div className="preview-field"><Label>Framework</Label><NativeSelect defaultValue="react"><option value="react">React</option><option value="native">React Native</option></NativeSelect></div>
          <div className="preview-field"><Label>Density</Label><div className="preview-x-scroll preview-x-scroll-inline"><ToggleGroup type="single" defaultValue="comfortable"><ToggleGroupItem value="compact">Compact</ToggleGroupItem><ToggleGroupItem value="comfortable">Comfortable</ToggleGroupItem></ToggleGroup></div></div>
        </div>
        <div className="preview-inline-row">
          <label className="preview-inline-control"><Checkbox defaultChecked /><span>Autosave</span></label>
          <label className="preview-inline-control"><Switch defaultChecked /><span>Inspector visible</span></label>
          <Toggle defaultPressed>Grid</Toggle>
        </div>
        <FieldSet>
          <FieldLegend>Runtime mode</FieldLegend>
          <FieldContent><div className="preview-x-scroll preview-x-scroll-inline"><RadioGroup defaultValue="workspace" className="preview-inline-row preview-wrap"><label className="preview-inline-control"><RadioGroupItem value="workspace" /><span>Workspace</span></label><label className="preview-inline-control"><RadioGroupItem value="docs" /><span>Docs</span></label></RadioGroup></div></FieldContent>
          <FieldDescription>Use field wrappers when labels and help text need consistent spacing.</FieldDescription>
          <FieldError>Choose at least one mode.</FieldError>
        </FieldSet>
        <Field>
          <FieldLabel>Package tag</FieldLabel>
          <FieldContent><Input defaultValue="latest" /></FieldContent>
          <FieldDescription>Simple field rows still work without a full form wrapper.</FieldDescription>
        </Field>
        <Form className="preview-pane">
          <FormField name="email" description="We only use this for release updates." error="Email is required.">
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input aria-label="Release email" placeholder="name@example.com" />
              </FormControl>
              <FormDescription />
              <FormMessage />
            </FormItem>
          </FormField>
        </Form>
        <InputGroup>
          <InputGroupAddon>pkg</InputGroupAddon>
          <Input defaultValue="synthex-ui" />
        </InputGroup>
        <div className="preview-field"><Label>Publish readiness</Label><Slider aria-label="Publish readiness" defaultValue={[72]} /></div>
        <div className="preview-inline-row"><Button>Save draft</Button><Button variant="outline">Preview</Button></div>
      </div>
    </ShowcaseSection>
  );
}
