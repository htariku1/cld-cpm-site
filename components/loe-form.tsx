import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar as UiCalendar } from "@/components/ui/calendar";
import { format, parse } from "date-fns";

function generateLoeId() {
  return "loe-" + Math.random().toString(36).slice(2, 10);
}

export function LOEForm({
  initialValues,
  milestones,
  onSubmit,
  onCancel,
  submitLabel
}: {
  initialValues: any,
  milestones: any[],
  onSubmit: (loe: any) => void,
  onCancel: () => void,
  submitLabel: string
}) {
  // Convert all form fields to controlled components
  const [name, setName] = useState(initialValues.name || "");
  const [description, setDescription] = useState(initialValues.purpose || initialValues.description || "");
  const [cpmrContributions, setCpmrContributions] = useState(initialValues.cpmrContributions || "");
  const [iaprContributions, setIaprContributions] = useState(initialValues.iaprContributions || "");
  const [tmtrContributions, setTmtrContributions] = useState(initialValues.tmtrContributions || "");
  const [deliverable, setDeliverable] = useState(initialValues.deliverable || "");
  const orgOptions = ["CPMR", "IAPR", "TMTR"];
  const [leadOrgs, setLeadOrgs] = useState<string[]>(initialValues.leadOrg ? initialValues.leadOrg.split(/, ?/) : []);
  const [supportingOrgs, setSupportingOrgs] = useState<string[]>(initialValues.supportingOrg ? initialValues.supportingOrg.split(/, ?/) : []);
  const [selectedMilestones, setSelectedMilestones] = useState<string[]>(initialValues.milestoneIds || []);
  const [startDate, setStartDate] = useState(initialValues.startDate || "");
  const [endDate, setEndDate] = useState(initialValues.endDate || "");

  // Only update form values when initialValues actually changes (not on every render)
  useEffect(() => {
    if (initialValues.id !== undefined) {
      setName(initialValues.name || "");
      setDescription(initialValues.purpose || initialValues.description || "");
      setCpmrContributions(initialValues.cpmrContributions || "");
      setIaprContributions(initialValues.iaprContributions || "");
      setTmtrContributions(initialValues.tmtrContributions || "");
      setDeliverable(initialValues.deliverable || "");
      setLeadOrgs(initialValues.leadOrg ? initialValues.leadOrg.split(/, ?/) : []);
      setSupportingOrgs(initialValues.supportingOrg ? initialValues.supportingOrg.split(/, ?/) : []);
      setSelectedMilestones(initialValues.milestoneIds || []);
      setStartDate(initialValues.startDate || "");
      setEndDate(initialValues.endDate || "");
    }
  }, [initialValues.id]);

  return (
    <div className="space-y-4 mt-6">
      <div>
        <Label htmlFor="loe-name">LOE Name <span style={{color: 'red'}}>*</span></Label>
        <Input 
          id="loe-name" 
          placeholder="Enter LOE name" 
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="flex flex-row items-center gap-6 mt-1">
        <div>
          <Label>Lead Org(s) <span style={{color: 'red'}}>*</span></Label>
          <div className="flex flex-row gap-2 mt-1">
            {orgOptions.map(option => (
              <label key={option} className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={leadOrgs.includes(option)}
                  onChange={e => {
                    if (e.target.checked) setLeadOrgs([...leadOrgs, option]);
                    else setLeadOrgs(leadOrgs.filter(o => o !== option));
                  }}
                />
                {option}
              </label>
            ))}
          </div>
          {leadOrgs.length > 0 && (
            <div className="text-xs text-gray-600 mt-1">
              <span className="font-semibold">Selected:</span> {leadOrgs.join(", ")}
            </div>
          )}
        </div>
        <div>
          <Label>Supporting Org(s) <span style={{color: 'red'}}>*</span></Label>
          <div className="flex flex-row gap-2 mt-1">
            {orgOptions.map(option => (
              <label key={option} className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={supportingOrgs.includes(option)}
                  onChange={e => {
                    if (e.target.checked) setSupportingOrgs([...supportingOrgs, option]);
                    else setSupportingOrgs(supportingOrgs.filter(o => o !== option));
                  }}
                />
                {option}
              </label>
            ))}
          </div>
          {supportingOrgs.length > 0 && (
            <div className="text-xs text-gray-600 mt-1">
              <span className="font-semibold">Selected:</span> {supportingOrgs.join(", ")}
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="loe-start-date">Start Date <span style={{color: 'red'}}>*</span></Label>
          <Popover>
            <PopoverTrigger asChild>
              <Input
                id="loe-start-date"
                value={startDate ? format(parse(startDate, "yyyy-MM-dd", new Date()), "MMMM dd, yyyy") : ""}
                placeholder="Select start date"
                readOnly
              />
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <UiCalendar
                mode="single"
                selected={startDate ? parse(startDate, "yyyy-MM-dd", new Date()) : undefined}
                onSelect={date => {
                  setStartDate(date ? format(date, "yyyy-MM-dd") : "");
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <Label htmlFor="loe-end-date">End Date <span style={{color: 'red'}}>*</span></Label>
          <Popover>
            <PopoverTrigger asChild>
              <Input
                id="loe-end-date"
                value={endDate ? format(parse(endDate, "yyyy-MM-dd", new Date()), "MMMM dd, yyyy") : ""}
                placeholder="Select end date"
                readOnly
              />
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <UiCalendar
                mode="single"
                selected={endDate ? parse(endDate, "yyyy-MM-dd", new Date()) : undefined}
                onSelect={date => {
                  setEndDate(date ? format(date, "yyyy-MM-dd") : "");
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div>
        <Label htmlFor="loe-purpose">Description <span style={{color: 'red'}}>*</span></Label>
        <Textarea 
          id="loe-purpose" 
          placeholder="Describe the purpose of this LOE" 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="loe-deliverable">LOE Deliverable <span style={{color: 'red'}}>*</span></Label>
        <Input 
          id="loe-deliverable" 
          placeholder="Enter LOE deliverable" 
          value={deliverable} 
          onChange={e => setDeliverable(e.target.value)} 
        />
      </div>
      <div>
        <Label htmlFor="cpmr-contrib">CPMR Contributions</Label>
        <Textarea 
          id="cpmr-contrib" 
          placeholder="Describe CPMR contributions" 
          value={cpmrContributions}
          onChange={(e) => setCpmrContributions(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="iapr-contrib">IAPR Contributions</Label>
        <Textarea 
          id="iapr-contrib" 
          placeholder="Describe IAPR contributions" 
          value={iaprContributions}
          onChange={(e) => setIaprContributions(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="tmtr-contrib">TMTR Contributions</Label>
        <Textarea 
          id="tmtr-contrib" 
          placeholder="Describe TMTR contributions" 
          value={tmtrContributions}
          onChange={(e) => setTmtrContributions(e.target.value)}
        />
      </div>
      <div>
        <Label>Associated Milestones</Label>
        <div className="max-h-40 overflow-y-auto border rounded-md p-3 mt-2">
          {milestones.length > 0 ? milestones.map(milestone => (
            <div key={milestone.id} className="flex items-start space-x-2 py-2 border-b border-gray-100 last:border-b-0">
              <Checkbox
                id={`loe-milestone-${milestone.id}`}
                checked={selectedMilestones.includes(milestone.id)}
                onCheckedChange={checked => {
                  if (checked) setSelectedMilestones([...selectedMilestones, milestone.id]);
                  else setSelectedMilestones(selectedMilestones.filter(id => id !== milestone.id));
                }}
              />
              <div className="flex-1">
                <Label htmlFor={`loe-milestone-${milestone.id}`} className="text-sm font-medium">
                  {milestone.name}
                </Label>
                <p className="text-xs text-gray-600 mt-1">{milestone.description}</p>
                <p className="text-xs text-gray-500">Date: {milestone.date}</p>
              </div>
            </div>
          )) : <p className="text-gray-500 text-sm text-center py-4">No milestones available.</p>}
        </div>
        <p className="text-xs text-gray-500 mt-2">Select milestones that are directly associated with this LOE&apos;s deliverables and timeline.</p>
      </div>
      <div className="flex gap-2">
        <Button
          onClick={() => {
            const loe = {
              ...initialValues,
              id: initialValues.id || generateLoeId(),
              name: name,
              purpose: description,
              startDate: startDate || new Date().toISOString().slice(0, 10),
              endDate: endDate || new Date().toISOString().slice(0, 10),
              deliverable,
              leadOrg: leadOrgs.join(", "),
              supportingOrg: supportingOrgs.join(", "),
              cpmrContributions: cpmrContributions,
              iaprContributions: iaprContributions,
              tmtrContributions: tmtrContributions,
              milestoneIds: selectedMilestones,
            };
            onSubmit(loe);
          }}
        >
          {submitLabel}
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Back
        </Button>
      </div>
    </div>
  );
} 