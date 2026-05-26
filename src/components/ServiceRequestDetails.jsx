import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChatBubbleBottomCenterTextIcon,
  EnvelopeIcon,
  PhoneIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import InputField from "./InputField";
import FormField from "./FormField";
import Dropdowns from "./Dropdowns";
import RequesterSearchOverlay from "./RequesterSearchOverlay";
import { useUsers } from "../context/UsersContext";
import {
  REQUEST_TYPES,
  SOURCE_TYPES,
  CONTRACT_TYPES,
  SITES,
  YES_OR_NO,
} from "../utils/constants";

export default function ServiceRequestDetails({
  className = "",
  caseItem,
  fields,
  setFields,
  woMode = false,
  isLocked: isLockedProp,
  errors = {},
}) {
  const navigate = useNavigate();
  const { users } = useUsers();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchRequesterOpen, setSearchRequesterOpen] = useState(false);

  // In WO mode only the requester (padlock) stays locked; everything else editable
  const isTerminalCase = ["Converted", "Cancelled"].includes(caseItem?.case_status);
  const isLocked     = isLockedProp ?? (woMode ? false : isTerminalCase);
  const requesterLocked = isLockedProp ?? (woMode ? true : isTerminalCase);

  const goToUser = (displayName) => {
    if (!displayName) return;
    const found = users.find((u) => u.displayName === displayName);
    if (found) navigate(`/admin/users/${found.id}`);
  };

  const handleRequesterSelect = (user) => {
    setFields((prev) => ({
      ...prev,
      requester: user.displayName,
      requesterEmail: user.email,
      affectedRequester: user,
      contractType: user.contractType,
      site: user.site,
      requesterExist: "Yes",
      isStudent: user.isStudent ? "Yes" : "No",
      clientEmployee: user.clientEmployee ? "Yes" : "No",
    }));
  };

  const handleChange = (key) => (e) =>
    setFields((prev) => ({ ...prev, [key]: e.target.value }));

  const handleDropdownChange = (key) => (val) => {
    setFields((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  return (
    <>
      <div
        className={`w-full px-3 py-3 rounded-lg bg-obsidianNight/40 flex flex-col ${className}`}
      >
        {/* Header */}
        <div className="pb-1 flex items-center justify-between">
          <h2 className="text-sm sm:text-sm text-left font-bold leading-6 text-white truncate">
            Case Details
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="sm:col-span-2 sm:w-1/2">
            <InputField
              inputText="!text-electricBlue"
              id="CaseId"
              label="Case Id"
              name="Case Id"
              value={fields.caseId}
              required="true"
              autoComplete="off"
              isRequired={true}
              fieldLocked={true}
            />
          </div>
          <InputField
            inputText="!text-electricBlue underline cursor-pointer"
            id="Requester"
            label="Requester"
            name="Requester"
            value={fields.requester}
            required="true"
            autoComplete="off"
            showSearch={!requesterLocked}
            onSearchClick={() => !requesterLocked && setSearchRequesterOpen(true)}
            onClick={() => goToUser(fields.requester)}
            isRequired={true}
            fieldLocked={requesterLocked}
            readOnly
          />
          <InputField
            inputText="!text-electricBlue underline cursor-pointer"
            id="AffectedRequester"
            label="Affected Requester"
            name="Affected Requester"
            value={fields.affectedRequester?.displayName ?? ""}
            required="true"
            autoComplete="off"
            showSearch={!isLocked}
            onSearchClick={() => !isLocked && setSearchOpen(true)}
            onClick={() => goToUser(fields.affectedRequester?.displayName)}
            isRequired={true}
            fieldLocked={isLocked}
            readOnly
          />

          {fields.isStudent !== "No" ? (
            <Dropdowns
              optionList={YES_OR_NO}
              defaultValue={
                fields.isStudent === false
                  ? null
                  : fields.isStudent === true
                  ? YES_OR_NO[0]
                  : fields.isStudent
              }
              label="Student"
              optionPlaceholder="Select option"
              dropdownBtnCls="bg-white/5 outline-white/10 px-3 py-1"
              showLabel={true}
              className="w-full"
              isRequired={true}
              disabled={isLocked}
              onChange={handleDropdownChange("isStudent")}
            />
          ) : (
            <Dropdowns
              optionList={YES_OR_NO}
              defaultValue={
                fields.clientEmployee === false
                  ? null
                  : fields.clientEmployee === true
                  ? YES_OR_NO[0]
                  : fields.clientEmployee
              }
              label="Client Employee"
              optionPlaceholder="Select client employee"
              dropdownBtnCls="bg-white/5 outline-white/10 px-3 py-1"
              showLabel={true}
              className="w-full"
              isRequired={true}
              disabled={isLocked}
              onChange={handleDropdownChange("clientEmployee")}
            />
          )}

          <Dropdowns
            optionList={YES_OR_NO}
            defaultValue={
              fields.requesterExist === false
                ? null
                : fields.requesterExist === true
                ? YES_OR_NO[0]
                : fields.requesterExist
            }
            label="Requester Exist"
            optionPlaceholder="Select requester exist"
            dropdownBtnCls="bg-white/5 outline-white/10 px-3 py-1"
            showLabel={true}
            className="w-full"
            isRequired={true}
            disabled={isLocked}
            onChange={handleDropdownChange("requesterExist")}
          />
          <Dropdowns
            optionList={REQUEST_TYPES}
            defaultValue={fields.requestTypes}
            label="Request Type"
            optionPlaceholder="Select request type"
            dropdownBtnCls="bg-white/5 outline-white/10 px-3 py-1"
            showLabel={true}
            className="w-full"
            isRequired={true}
            disabled={isLocked}
            onChange={handleDropdownChange("requestTypes")}
          />
          <Dropdowns
            optionList={SOURCE_TYPES}
            defaultValue={fields.source}
            label="Source"
            optionPlaceholder="Select Source"
            dropdownBtnCls="bg-white/5 outline-white/10 px-3 py-1"
            showLabel={true}
            className="w-full"
            isRequired={true}
            disabled={isLocked}
            onChange={handleDropdownChange("source")}
          />
          <Dropdowns
            optionList={CONTRACT_TYPES}
            defaultValue={fields.contractType}
            label="Contract"
            optionPlaceholder="Select contract"
            dropdownBtnCls="bg-white/5 outline-white/10 px-3 py-1"
            showLabel={true}
            className="w-full"
            isRequired={true}
            disabled={isLocked}
            onChange={handleDropdownChange("contractType")}
          />
          <Dropdowns
            optionList={SITES}
            defaultValue={fields.site}
            label="Site"
            optionPlaceholder="Select site"
            dropdownBtnCls="bg-white/5 outline-white/10 px-3 py-1"
            showLabel={true}
            className="w-full"
            isRequired={true}
            disabled={isLocked}
            onChange={handleDropdownChange("site")}
          />
          <FormField label="Description" isRequired={true} error={errors.description}>
            <textarea
              value={fields.description}
              onChange={isLocked ? undefined : handleChange("description")}
              readOnly={isLocked}
              placeholder="Describe the issue as reported…"
              className={`block w-full h-40 rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-electricBlue sm:text-sm/6 resize-none leading-relaxed transition-colors${errors.description ? " outline-red-500/60 ring-1 ring-red-500/40" : " outline-white/10"}${isLocked ? " opacity-50 cursor-default" : ""}`}
            />
          </FormField>
          <div className={`mt-auto block w-full h-40 border-dashed rounded-md bg-white/5 px-3 flex items-center justify-center text-white outline-1 -outline-offset-1 outline-white/10${isLocked ? " opacity-40 pointer-events-none" : ""}`}>
            <div className="text-center">
              <p className="text-[11px] text-slate-400">
                Drag & drop attachments or{" "}
                <span className="text-electricBlue cursor-pointer">browse</span>
              </p>
              <p className="text-[10px] text-slate-300 mt-0.5">
                Images, PDFs up to 20 MB
              </p>
            </div>
          </div>
        </div>
      </div>

      {!requesterLocked && (
        <RequesterSearchOverlay
          isOpen={searchRequesterOpen}
          onClose={() => setSearchRequesterOpen(false)}
          contractType=""
          onSelect={handleRequesterSelect}
        />
      )}

      {!isLocked && (
        <RequesterSearchOverlay
          isOpen={searchOpen}
          onClose={() => setSearchOpen(false)}
          contractType={fields.contractType}
          onSelect={(user) =>
            setFields((prev) => ({ ...prev, affectedRequester: user }))
          }
        />
      )}
    </>
  );
}
