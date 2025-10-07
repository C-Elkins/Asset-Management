# 🧪 Testing Guide - Asset Creation Page Improvements

## Quick Test Scenarios

### Scenario 1: Test Computer Detection
**Input**: "MacBook Pro 16-inch"
**Expected**:
- ✓ Category: Computers (95%+ confidence)
- ✓ Brand: Apple
- ✓ Model: Pro
- ✓ Location: IT Department
- ✓ Warranty: 12 months
- ✓ Description: Auto-generated with "Professional grade equipment"

**Steps**:
1. Navigate to `/app/assets/new`
2. Type asset name: "MacBook Pro 16-inch"
3. Wait ~600ms
4. Check green AI insights card appears
5. Verify all fields auto-populated
6. Check confidence percentage shown

---

### Scenario 2: Test Vehicle Detection
**Input**: "Toyota Camry 2024 XLE"
**Expected**:
- ✓ Category: Vehicles (95%+ confidence)
- ✓ Brand: Toyota
- ✓ Model: XLE
- ✓ Location: Fleet Parking
- ✓ Warranty: 36 months

**Steps**:
1. Clear form or reload page
2. Type asset name: "Toyota Camry 2024 XLE"
3. Observe AI analysis
4. Verify vehicle-specific suggestions

---

### Scenario 3: Test Auto-Save Feature
**Input**: Partial form data
**Expected**:
- ✓ "Draft auto-saved" message appears after 2 seconds
- ✓ Green checkmark indicator
- ✓ Draft persists on page reload
- ✓ Prompt to restore draft

**Steps**:
1. Start filling out form (name, brand, etc.)
2. Wait 2-3 seconds
3. Look for green "Draft auto-saved" banner
4. Refresh the page
5. See "Found a saved draft" prompt
6. Click "OK" to restore
7. Verify all data restored

---

### Scenario 4: Test Tool Detection
**Input**: "DeWalt 20V FlexVolt Drill"
**Expected**:
- ✓ Category: Tools (95%+ confidence)
- ✓ Brand: DeWalt
- ✓ Model: 20V or FlexVolt
- ✓ Location: Tool Storage
- ✓ Warranty: 36 months

**Steps**:
1. Enter tool information
2. Watch AI detect tool category
3. Verify tool-specific location suggestion

---

### Scenario 5: Test Medical Equipment
**Input**: "Philips IntelliVue Patient Monitor"
**Expected**:
- ✓ Category: Medical Devices (90%+ confidence)
- ✓ Brand: Philips
- ✓ Model: IntelliVue
- ✓ Location: Medical Ward
- ✓ Warranty: 12 months

**Steps**:
1. Enter medical equipment details
2. Observe AI suggestions
3. Check medical-specific fields

---

### Scenario 6: Test Network Equipment
**Input**: "Cisco Catalyst 2960-X Switch"
**Expected**:
- ✓ Category: Network Equipment (92%+ confidence)
- ✓ Brand: Cisco
- ✓ Model: 2960-X or Catalyst
- ✓ Location: Server Room
- ✓ Warranty: 36 months

**Steps**:
1. Enter network device info
2. Verify server room location suggested
3. Check 36-month warranty

---

## UI/UX Testing

### Visual Design Tests
- [ ] Gradient background renders smoothly
- [ ] Header animation plays on load
- [ ] "Back to Assets" button has hover effect
- [ ] Quick tips section is visible
- [ ] Tips can be dismissed (X button works)
- [ ] Feature badges display at bottom
- [ ] Form card has proper shadow
- [ ] All icons render correctly

### Animation Tests
- [ ] Page fade-in is smooth
- [ ] Tips cards stagger (0.1s delay each)
- [ ] AI insights card slides in from top
- [ ] Auto-save banner fades in/out
- [ ] Button hover scales to 1.02x
- [ ] Button tap scales to 0.98x

### Responsive Tests
- [ ] Works on desktop (1920x1080)
- [ ] Works on laptop (1366x768)
- [ ] Works on tablet (768x1024)
- [ ] Works on mobile (375x667)
- [ ] Tips cards stack on mobile
- [ ] Form fields are full width on mobile

---

## AI Functionality Tests

### Brand Detection
Test each major brand category:
- [ ] Apple products (Mac, iPhone, iPad)
- [ ] Dell computers (Latitude, Precision, OptiPlex)
- [ ] HP computers (EliteBook, ProBook)
- [ ] Lenovo computers (ThinkPad, IdeaPad)
- [ ] Microsoft Surface devices
- [ ] Cisco network equipment
- [ ] Toyota vehicles
- [ ] Ford vehicles
- [ ] Philips medical devices
- [ ] DeWalt tools
- [ ] Milwaukee tools

### Model Recognition
- [ ] MacBook Pro/Air detected
- [ ] M1/M2/M3 chips detected
- [ ] Vehicle trim levels (XLE, LT, etc.)
- [ ] Tool voltage (20V, 60V)
- [ ] Network model numbers (2960, 3850)

### Location Suggestions
- [ ] IT Department for computers
- [ ] Server Room for network gear
- [ ] Fleet Parking for vehicles
- [ ] Medical Ward for medical devices
- [ ] Tool Storage for power tools
- [ ] Equipment Yard for machinery
- [ ] Office for printers/furniture

### Warranty Predictions
- [ ] 12 months for Apple
- [ ] 36 months for Dell/HP/Lenovo
- [ ] 36 months for vehicles
- [ ] 36 months for DeWalt/Milwaukee
- [ ] 12 months for medical equipment

---

## Performance Tests

### AI Response Time
- [ ] AI analysis starts within 600ms of typing
- [ ] Total analysis completes within 1-2 seconds
- [ ] No lag in UI during analysis
- [ ] Multiple rapid changes handled gracefully

### Auto-Save Performance
- [ ] Draft saves within 2 seconds of change
- [ ] No UI freeze during save
- [ ] Multiple rapid changes debounced properly
- [ ] LocalStorage doesn't exceed limits

### Form Performance
- [ ] Form inputs are responsive
- [ ] No lag when typing
- [ ] Validation is instant
- [ ] Submit button responds immediately

---

## Error Handling Tests

### AI Failures
- [ ] Graceful fallback if backend unavailable
- [ ] Client-side AI still works
- [ ] User sees appropriate message
- [ ] No console errors

### Auto-Save Failures
- [ ] Handles localStorage quota exceeded
- [ ] Shows error status if save fails
- [ ] Doesn't block form submission

### Form Validation
- [ ] Required fields show errors
- [ ] Errors clear when typing
- [ ] Submit blocked if invalid
- [ ] Error messages are clear

### Network Issues
- [ ] Handles slow connections
- [ ] Timeout after reasonable period
- [ ] Retry logic works
- [ ] User feedback provided

---

## Accessibility Tests

### Keyboard Navigation
- [ ] Tab through all form fields
- [ ] Enter key submits form
- [ ] Escape key closes modals
- [ ] Focus indicators visible
- [ ] Logical tab order

### Screen Reader
- [ ] Form labels read correctly
- [ ] Error messages announced
- [ ] AI suggestions announced
- [ ] Button purposes clear
- [ ] Status updates announced

### Color Contrast
- [ ] Text readable on all backgrounds
- [ ] Error messages have sufficient contrast
- [ ] AI insights readable
- [ ] Focus indicators visible

---

## Integration Tests

### End-to-End Flow
1. [ ] Navigate to create page
2. [ ] See quick tips
3. [ ] Start typing asset name
4. [ ] AI analyzes input
5. [ ] Suggestions appear
6. [ ] Fields auto-populate
7. [ ] Draft auto-saves
8. [ ] Complete remaining fields
9. [ ] Submit form
10. [ ] Success message appears
11. [ ] Redirect to assets list
12. [ ] New asset appears in list

### Draft Recovery Flow
1. [ ] Start creating asset
2. [ ] Partially fill form
3. [ ] Wait for auto-save
4. [ ] Close browser tab
5. [ ] Reopen create page
6. [ ] See restore prompt
7. [ ] Accept restoration
8. [ ] Verify all data restored
9. [ ] Complete and submit
10. [ ] Draft cleared after success

---

## Rate Limiting Tests

### Backend Endpoint
- [ ] Can make 30 requests in 5 minutes
- [ ] 31st request returns 429
- [ ] Retry-After header present
- [ ] Rate limit resets after 5 minutes
- [ ] Different users have separate limits

---

## Browser Compatibility

### Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile Browsers
- [ ] iOS Safari
- [ ] Chrome Mobile
- [ ] Samsung Internet

---

## Common Issues & Solutions

### AI Not Working
**Symptom**: No AI suggestions appear
**Check**:
- Network tab for API calls
- Console for errors
- Fallback AI should still work
- Try different asset names

### Auto-Save Not Working
**Symptom**: Draft not saving
**Check**:
- LocalStorage available
- Console for errors
- Try different browser
- Clear localStorage and retry

### Form Not Submitting
**Symptom**: Submit button doesn't work
**Check**:
- Required fields filled
- Validation errors
- Network connectivity
- Console errors

---

## Test Data

### Sample Assets to Test

**Computers:**
- MacBook Pro 16-inch M2
- Dell Latitude 5420
- HP EliteBook 840 G8
- Lenovo ThinkPad X1 Carbon
- Microsoft Surface Laptop 5

**Vehicles:**
- Toyota Camry 2024 XLE
- Ford F-150 Lariat
- Honda CR-V EX-L
- Chevrolet Silverado LT

**Medical:**
- Philips IntelliVue MX450
- GE DASH 4000 Patient Monitor
- Siemens ACUSON P500

**Tools:**
- DeWalt 20V MAX Cordless Drill
- Milwaukee M18 Fuel Impact Driver
- Bosch Professional GBH 2-28

**Network:**
- Cisco Catalyst 2960-X Switch
- Ubiquiti UniFi Dream Machine Pro
- Cisco Meraki MR46 Access Point

---

## Success Criteria

### Must Have
- ✓ Page loads without errors
- ✓ AI suggestions appear
- ✓ Auto-save works
- ✓ Form submits successfully
- ✓ All animations smooth

### Should Have
- ✓ All 30+ brands detected
- ✓ Model recognition works
- ✓ Location suggestions accurate
- ✓ Warranty predictions correct
- ✓ Draft recovery works

### Nice to Have
- ✓ Sub-second AI response
- ✓ Perfect mobile experience
- ✓ Accessibility AAA compliance
- ✓ Zero console errors
- ✓ Beautiful animations

---

## Report Template

```markdown
## Test Report - Asset Creation Page

**Date**: [Date]
**Tester**: [Name]
**Browser**: [Browser + Version]
**OS**: [Operating System]

### Summary
- Total Tests: X
- Passed: Y
- Failed: Z
- Blocked: W

### Critical Issues
1. [Issue description]
   - Steps to reproduce
   - Expected vs Actual
   - Screenshot/video

### Minor Issues
1. [Issue description]

### Suggestions
1. [Improvement idea]

### Overall Assessment
[Pass/Fail/Needs Work]
```

---

**Remember**: The goal is delightful user experience with intelligent automation!
