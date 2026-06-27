# Legal & Contractual Framework for Provider Agreements

## Executive Summary

This guide covers the legal and contractual aspects of partnering with AI providers. It includes template agreements, liability frameworks, compliance requirements, and dispute resolution mechanisms.

---

## PART 1: CORE LEGAL PRINCIPLES

### 1.1 Relationship Structure

**What You Are:**
- A **reseller** of AI API services (not a broker or agent)
- A **service provider** that adds value through aggregation
- A **data processor** (handles API keys and usage data)
- An **independent contractor** (not an employee of providers)

**What You Are NOT:**
- A partner with equity stakes
- An exclusive distributor
- A representative of the provider
- Liable for provider's service quality

### 1.2 Three-Party Relationship

```
Provider (OpenAI, Anthropic, etc.)
    ↓
    └─ API Agreement ─→ TokenGateway (You)
                           ↓
                           └─ Terms of Service ─→ Developer (End User)

Legal Chain:
Provider's ToS → Your Agreement with Provider → Your ToS with Developers
```

### 1.3 Key Legal Concepts

**Indemnification:** Each party protects the others from legal liability
- Provider indemnifies you from their API failures
- You indemnify developers from your platform failures
- You indemnify providers from developer misuse

**Limitation of Liability:** Caps on damages each party can claim
- Typically: liability capped at fees paid in the last 12 months
- Excludes: data breaches, willful misconduct, gross negligence

**Warranty Disclaimer:** What you're NOT guaranteeing
- Service uptime (you're just a proxy)
- API quality (provider's responsibility)
- Data accuracy (provider's responsibility)

**Compliance:** Legal requirements you must follow
- GDPR (if EU users)
- CCPA (if California users)
- SOC 2 (for enterprise customers)
- PCI DSS (for payment handling)

---

## PART 2: PROVIDER PARTNERSHIP AGREEMENT

### 2.1 Agreement Structure

A typical provider partnership agreement includes:

```
1. Definitions & Interpretation
2. Services & Scope
3. Revenue Sharing & Payment Terms
4. Term & Termination
5. Intellectual Property
6. Confidentiality
7. Data Protection & Privacy
8. Warranties & Disclaimers
9. Indemnification & Liability
10. Compliance & Regulations
11. Dispute Resolution
12. Miscellaneous (Governing Law, etc.)
```

### 2.2 Template: Provider Partnership Agreement

```
═══════════════════════════════════════════════════════════════════
PROVIDER PARTNERSHIP AGREEMENT

This Agreement is entered into as of [DATE] between:

PROVIDER: Anthropic PBC ("Provider")
ADDRESS: [Provider Address]

AND

TOKENGATEWAY: TokenGateway Inc. ("Reseller")
ADDRESS: [Your Address]

═══════════════════════════════════════════════════════════════════

1. DEFINITIONS

"API": Provider's application programming interface for accessing Claude models
"API Key": Unique credential provided by Provider to Reseller
"Confidential Information": Non-public information shared between parties
"End Users": Developers who purchase tokens through TokenGateway
"Fees": Revenue share and payment terms as defined in Schedule A
"Services": Reselling Provider's API through TokenGateway platform
"Term": Initial period of [12 months] from Effective Date

2. SERVICES & SCOPE

2.1 License Grant
Provider grants Reseller a non-exclusive, non-transferable license to:
- Resell Provider's API to End Users
- Integrate Provider's API into TokenGateway platform
- Display Provider's branding and models on TokenGateway

2.2 Restrictions
Reseller shall NOT:
- Claim exclusive rights to Provider's API
- Modify or reverse-engineer Provider's API
- Sublicense Provider's API to third parties
- Use Provider's API for purposes other than resale
- Claim ownership of Provider's intellectual property

2.3 Scope of Resale
- Reseller may resell to unlimited End Users
- Reseller may operate in all geographic regions
- Reseller may use all of Provider's available models
- Reseller may set own pricing (subject to minimum pricing if required)

3. REVENUE SHARING & PAYMENT TERMS

3.1 Revenue Share
- Provider receives: 85% of all revenue from End User purchases
- Reseller receives: 15% of all revenue from End User purchases
- Revenue calculated: Based on actual tokens consumed by End Users

3.2 Payment Schedule
- Settlement period: Monthly (1st-30th/31st of each month)
- Payment date: 5th of following month
- Payment method: Bank transfer or cryptocurrency (as agreed)
- Currency: USD (or as agreed)

3.3 Payment Calculation Example
```
Total End User Purchases: $100,000
Stripe Fees (2.9% + $0.30): -$2,900.30
Net Revenue: $97,099.70

Provider Payment (85%): $82,534.75
Reseller Payment (15%): $14,565.00
```

3.4 Invoicing & Reporting
- Reseller provides detailed invoice by 3rd of month
- Invoice includes:
  - Total API calls
  - Total tokens consumed
  - Revenue breakdown by model
  - Top customers (anonymized)
  - Calculation of revenue share
- Provider has 30 days to dispute charges

3.5 Minimum Revenue Guarantee (Optional)
- Provider may require minimum monthly revenue
- If actual revenue < minimum: Reseller pays difference
- Typical range: $1,000-$10,000/month depending on provider

3.6 Audit Rights
- Provider may audit Reseller's records once per year
- Audit conducted by independent third party
- Reseller covers audit costs if discrepancy > 5%
- Audit results kept confidential

4. TERM & TERMINATION

4.1 Initial Term
- Effective Date: [DATE]
- Initial Term: 12 months
- Automatic Renewal: Renews for successive 12-month periods unless terminated

4.2 Termination for Convenience
- Either party may terminate with 90 days written notice
- No penalty for termination
- Reseller continues to service existing End Users during notice period

4.3 Termination for Cause
Provider may terminate immediately if Reseller:
- Violates terms of this Agreement
- Fails to pay fees within 30 days of invoice
- Breaches confidentiality obligations
- Uses API for unauthorized purposes
- Violates applicable laws

Reseller may terminate immediately if Provider:
- Discontinues API service
- Materially breaches this Agreement
- Fails to pay Reseller's commission within 60 days

4.4 Effect of Termination
Upon termination:
- Reseller's license to resell terminates
- Reseller must cease marketing Provider's API
- Existing End User subscriptions continue until expiration
- Final settlement within 30 days
- All Confidential Information returned or destroyed

4.5 Survival
Sections 5 (IP), 6 (Confidentiality), 7 (Data Protection), 8 (Warranties), 
9 (Indemnification), and 10 (Compliance) survive termination.

5. INTELLECTUAL PROPERTY

5.1 Ownership
- Provider owns all IP related to API, models, and algorithms
- Reseller owns IP related to TokenGateway platform
- Neither party grants IP ownership to the other

5.2 Trademarks
- Reseller may use Provider's trademarks to identify services
- Use must be accurate and non-misleading
- Reseller must comply with Provider's branding guidelines
- Provider may revoke trademark license upon termination

5.3 Feedback
- Reseller may provide feedback on API to Provider
- Provider may use feedback without compensation
- Reseller retains rights to any proprietary information in feedback

6. CONFIDENTIALITY

6.1 Definition
Confidential Information includes:
- API keys and credentials
- Revenue and usage data
- Business plans and strategies
- Technical specifications
- Customer lists

6.2 Obligations
Each party shall:
- Maintain confidentiality of other party's information
- Limit access to employees with legitimate need
- Protect information with reasonable security measures
- Not disclose to third parties without written consent

6.3 Exceptions
Confidential Information does not include information that:
- Is publicly available
- Was known before disclosure
- Is independently developed
- Is required to be disclosed by law

6.4 Duration
- Confidentiality obligations survive termination
- Continue for 5 years after termination
- Perpetual for trade secrets

7. DATA PROTECTION & PRIVACY

7.1 Data Controller/Processor
- Provider: Data Controller (determines how data is used)
- Reseller: Data Processor (processes data on behalf of Provider)
- Developer: Data Subject (owns the data)

7.2 GDPR Compliance (if applicable)
- Reseller shall comply with GDPR Article 28
- Reseller shall execute Data Processing Agreement (DPA)
- Reseller shall implement appropriate security measures
- Reseller shall assist with data subject requests

7.3 Data Security
Reseller shall:
- Encrypt all API keys at rest (AES-256)
- Encrypt all data in transit (TLS 1.3)
- Implement access controls and authentication
- Maintain audit logs for 2 years
- Conduct annual security audits
- Report security breaches within 24 hours

7.4 Data Retention
- API keys: Deleted within 30 days of account termination
- Usage logs: Retained for 2 years for audit purposes
- Developer data: Deleted per Developer's request

7.5 Sub-processors
Reseller may use sub-processors (e.g., cloud providers):
- Must notify Provider of sub-processors
- Must ensure sub-processors comply with this Agreement
- Remains liable to Provider for sub-processor performance

8. WARRANTIES & DISCLAIMERS

8.1 Reseller Warranties
Reseller warrants that:
- Has authority to enter this Agreement
- Will comply with all applicable laws
- Will not violate third-party rights
- Will maintain API key confidentiality
- Will provide accurate usage reporting

8.2 Provider Warranties
Provider warrants that:
- Owns or controls the API
- API does not infringe third-party rights
- API will function substantially as described

8.3 Disclaimer of Warranties
EXCEPT AS EXPRESSLY STATED, PROVIDER AND RESELLER DISCLAIM ALL WARRANTIES:
- NO WARRANTY OF MERCHANTABILITY
- NO WARRANTY OF FITNESS FOR PARTICULAR PURPOSE
- NO WARRANTY OF UNINTERRUPTED SERVICE
- NO WARRANTY OF ERROR-FREE OPERATION

8.4 Service Level Agreement (Optional)
If included:
- Provider commits to 99.5% uptime
- Measured monthly
- Excludes scheduled maintenance and force majeure
- Reseller receives service credits for downtime:
  - 99.0-99.5% uptime: 5% monthly fee credit
  - 95.0-99.0% uptime: 10% monthly fee credit
  - < 95.0% uptime: 25% monthly fee credit

9. INDEMNIFICATION & LIABILITY

9.1 Provider Indemnification
Provider shall indemnify Reseller from claims that:
- API infringes third-party intellectual property rights
- API violates third-party privacy rights
- Provider's breach of this Agreement

9.2 Reseller Indemnification
Reseller shall indemnify Provider from claims that:
- Reseller's use of API violates third-party rights
- Reseller's platform violates third-party rights
- Reseller's breach of this Agreement
- Reseller's End Users violate applicable laws

9.3 Indemnification Procedure
Indemnified party shall:
- Notify indemnifying party within 30 days
- Allow indemnifying party to control defense
- Cooperate in defense at indemnifying party's expense
- Not settle without indemnifying party's consent

9.4 Limitation of Liability
NEITHER PARTY SHALL BE LIABLE FOR:
- Indirect, incidental, consequential damages
- Lost profits, lost revenue, lost data
- Business interruption

LIABILITY CAPS:
- Direct damages: Limited to fees paid in last 12 months
- Exceptions: Data breaches, willful misconduct, IP infringement

9.5 Exceptions to Liability Caps
Liability is NOT capped for:
- Breach of confidentiality
- Intellectual property infringement
- Gross negligence or willful misconduct
- Indemnification obligations

10. COMPLIANCE & REGULATIONS

10.1 Applicable Laws
This Agreement is governed by the laws of [JURISDICTION]
(typically: Delaware or California for US companies)

10.2 Regulatory Compliance
Both parties shall comply with:
- Export control laws (ITAR, EAR)
- Anti-bribery laws (FCPA, UK Bribery Act)
- Sanctions laws (OFAC)
- Anti-money laundering (AML)
- Know Your Customer (KYC)

10.3 Prohibited Use
Reseller shall NOT allow API use for:
- Illegal activities
- Fraud or deception
- Harassment or abuse
- Weapons development
- Surveillance or privacy violation
- Unauthorized access to systems

10.4 Compliance Certification
Reseller certifies:
- Not on any government sanctions list
- Not owned by sanctioned entities
- Will comply with export control laws
- Will not resell to prohibited countries/entities

11. DISPUTE RESOLUTION

11.1 Informal Resolution (30 days)
- Either party notifies other of dispute
- Parties attempt to resolve through negotiation
- Escalate to executive management if needed

11.2 Mediation (30-60 days)
- If informal resolution fails, parties engage mediator
- Mediator is neutral third party
- Mediation location: [JURISDICTION]
- Each party bears own costs + split mediator costs

11.3 Arbitration (Final)
- If mediation fails, dispute goes to arbitration
- Arbitrator: Single arbitrator (or panel of 3 for disputes > $1M)
- Rules: American Arbitration Association (AAA) rules
- Location: [JURISDICTION]
- Costs: Loser pays arbitrator fees

11.4 Litigation (Alternative)
Either party may pursue litigation in courts of [JURISDICTION]
for injunctive relief or enforcement of arbitration award.

11.5 Injunctive Relief
Either party may seek injunctive relief for:
- Breach of confidentiality
- Misuse of intellectual property
- Unauthorized use of API

12. MISCELLANEOUS

12.1 Entire Agreement
This Agreement constitutes entire agreement and supersedes all prior 
agreements, understandings, and negotiations.

12.2 Amendments
This Agreement may only be amended in writing signed by both parties.

12.3 Severability
If any provision is invalid, remaining provisions continue in effect.

12.4 Waiver
Waiver of any provision must be in writing and does not waive other provisions.

12.5 Assignment
Neither party may assign without written consent of other party.
Exception: Provider may assign to affiliate without consent.

12.6 Force Majeure
Neither party liable for failure to perform due to:
- Natural disasters
- War, terrorism
- Government action
- Pandemics
- Internet outages beyond party's control

12.7 Notices
All notices must be in writing and sent to:
- Provider: [Address]
- Reseller: [Address]

12.8 Counterparts
This Agreement may be executed in counterparts (email, DocuSign, etc.)
and each counterpart constitutes an original.

═══════════════════════════════════════════════════════════════════

SCHEDULE A: REVENUE SHARING & FEES

1. Revenue Share
   - Provider: 85%
   - Reseller: 15%

2. Minimum Monthly Revenue: $5,000
   - If actual < $5,000: Reseller pays difference
   - Waived for first 6 months

3. Payment Terms
   - Settlement: Monthly
   - Payment Date: 5th of following month
   - Method: Bank transfer (USD)
   - Account: [Provider's Bank Details]

4. Pricing
   - Reseller may set own pricing
   - Minimum price: Not to exceed 50% discount from Provider's retail

5. Audit Rights
   - Annual audit permitted
   - Third-party auditor at Provider's expense
   - Results confidential

═══════════════════════════════════════════════════════════════════

SCHEDULE B: SERVICE LEVEL AGREEMENT (Optional)

1. Uptime Guarantee: 99.5% monthly availability

2. Measurement
   - Measured from Provider's perspective
   - Excludes scheduled maintenance (4 hours/month)
   - Excludes force majeure events

3. Service Credits
   - 99.0-99.5%: 5% monthly fee credit
   - 95.0-99.0%: 10% monthly fee credit
   - < 95.0%: 25% monthly fee credit

4. Credit Limitations
   - Credits do not excuse performance
   - Credits are sole remedy for downtime
   - Credits must be requested within 30 days

═══════════════════════════════════════════════════════════════════

SIGNATURE PAGE

Provider: Anthropic PBC

By: _________________________________
Name: _______________________________
Title: ________________________________
Date: ________________________________

Reseller: TokenGateway Inc.

By: _________________________________
Name: _______________________________
Title: ________________________________
Date: ________________________________

═══════════════════════════════════════════════════════════════════
```

---

## PART 3: DEVELOPER TERMS OF SERVICE

### 3.1 What You Need to Include

Your Terms of Service should cover:

```
1. Acceptance of Terms
2. Service Description
3. User Accounts & Registration
4. Acceptable Use Policy
5. Intellectual Property
6. Payment & Billing
7. Token Usage & Limitations
8. Warranties & Disclaimers
9. Limitation of Liability
10. Indemnification
11. Termination
12. Privacy Policy
13. Dispute Resolution
14. Governing Law
```

### 3.2 Key Sections for Developers

**Acceptable Use Policy:**
```
Users shall NOT use TokenGateway for:
- Illegal activities
- Fraud, deception, or abuse
- Harassment or threats
- Unauthorized access to systems
- Malware or virus distribution
- Weapons development
- Surveillance or privacy violation
- Competing with Provider's services
```

**Token Usage Limitations:**
```
- Tokens expire 1 year from purchase
- Tokens are non-refundable except for service failure
- Tokens cannot be transferred between accounts
- Tokens cannot be used to train competing models
- Excessive usage may result in rate limiting
```

**Payment Terms:**
```
- Tokens purchased are non-refundable
- Refunds only for service failure (Provider's fault)
- Stripe handles all payment processing
- Billing occurs at time of purchase
- Failed payments result in account suspension
```

**Limitation of Liability:**
```
TokenGateway is NOT liable for:
- Provider API failures or downtime
- Data loss or corruption
- Indirect or consequential damages
- Lost profits or revenue
- Business interruption

Liability is capped at fees paid in last 12 months
```

---

## PART 4: DATA PROCESSING AGREEMENT (DPA)

### 4.1 When You Need a DPA

You need a DPA if:
- You have EU users (GDPR applies)
- You have California users (CCPA applies)
- Provider requires it in contract
- You're processing personal data

### 4.2 Key DPA Provisions

```
1. Scope of Processing
   - What data is processed
   - Purpose of processing
   - Duration of processing
   - Types of data subjects

2. Data Processor Obligations
   - Only process data per Provider's instructions
   - Ensure confidentiality of staff
   - Implement appropriate security measures
   - Assist with data subject rights requests
   - Delete data upon termination

3. Sub-processors
   - List of approved sub-processors
   - Process for adding new sub-processors
   - Sub-processor liability

4. Data Subject Rights
   - Right to access
   - Right to rectification
   - Right to erasure ("right to be forgotten")
   - Right to restrict processing
   - Right to data portability

5. Security Measures
   - Encryption at rest (AES-256)
   - Encryption in transit (TLS 1.3)
   - Access controls and authentication
   - Audit logging
   - Incident response procedures

6. Data Breach Notification
   - Notify Provider within 24 hours
   - Provide details of breach
   - Cooperate with investigation
   - Implement remediation measures

7. Audit & Compliance
   - Annual security audits
   - Compliance certifications (SOC 2, ISO 27001)
   - Right to audit
   - Cooperation with regulators
```

---

## PART 5: LIABILITY & INSURANCE

### 5.1 Insurance Requirements

You should obtain:

**General Liability Insurance:**
- Coverage: $1M-$5M per occurrence
- Covers: Bodily injury, property damage, personal injury
- Provider: Should be named as additional insured

**Professional Liability Insurance:**
- Coverage: $1M-$5M per claim
- Covers: Errors, omissions, negligence
- Covers: Data breach liability

**Cyber Liability Insurance:**
- Coverage: $1M-$5M per claim
- Covers: Data breaches, ransomware, business interruption
- Covers: Privacy liability, regulatory fines

**Errors & Omissions Insurance:**
- Coverage: $1M-$5M per claim
- Covers: Professional mistakes, service failures

### 5.2 Insurance Certificates

Providers typically require:
- Certificate of Insurance showing coverage
- Provider named as additional insured
- 30-day cancellation notice clause
- Annual renewal proof

---

## PART 6: COMPLIANCE REQUIREMENTS

### 6.1 Export Control Compliance

**What You Must Do:**
- Check customers against OFAC sanctions list
- Comply with EAR (Export Administration Regulations)
- Comply with ITAR (International Traffic in Arms Regulations)
- Don't sell to prohibited countries/entities

**Prohibited Countries (OFAC):**
- Cuba, Iran, North Korea, Syria
- Crimea region
- Certain individuals and entities

**Prohibited Uses:**
- Weapons development
- Nuclear proliferation
- Terrorism financing
- Surveillance of dissidents

### 6.2 Anti-Bribery Compliance

**Foreign Corrupt Practices Act (FCPA):**
- Don't offer bribes to foreign officials
- Don't use intermediaries to bribe
- Applies to all companies with US operations

**UK Bribery Act:**
- Stricter than FCPA
- Applies to companies operating in UK
- Covers all forms of bribery

### 6.3 Anti-Money Laundering (AML)

**Know Your Customer (KYC):**
- Verify customer identity
- Understand source of funds
- Monitor for suspicious activity
- Report suspicious transactions to FinCEN

**Suspicious Activity Report (SAR):**
- File if transaction > $5,000 and suspicious
- File within 30 days of detection
- Keep confidential (don't tell customer)

### 6.4 GDPR Compliance (EU Users)

**Key Requirements:**
- Obtain explicit consent for data processing
- Implement privacy by design
- Conduct Data Protection Impact Assessments (DPIA)
- Appoint Data Protection Officer (DPO) if required
- Respond to data subject requests within 30 days
- Report data breaches within 72 hours

**Fines for Non-Compliance:**
- Up to €20M or 4% of global revenue (whichever is higher)

### 6.5 CCPA Compliance (California Users)

**Key Requirements:**
- Disclose data collection practices
- Allow users to opt-out of data sale
- Allow users to access their data
- Allow users to delete their data
- Don't discriminate against users who exercise rights

**Fines for Non-Compliance:**
- Up to $7,500 per violation
- Up to $2,500 per unintentional violation

---

## PART 7: DISPUTE RESOLUTION STRATEGIES

### 7.1 Negotiation Phase

**Initial Dispute:**
```
1. Document the issue
2. Notify other party in writing
3. Provide evidence and data
4. Propose resolution
5. Set 30-day negotiation deadline
```

**Escalation:**
```
1. Escalate to executive management
2. Schedule call/meeting
3. Present full case
4. Propose settlement
5. Set 30-day deadline
```

### 7.2 Mediation Phase

**Mediation Process:**
```
1. Select neutral mediator (agree on choice)
2. Each party presents case
3. Mediator facilitates discussion
4. Parties attempt to reach agreement
5. If successful: Mediation agreement signed
6. If unsuccessful: Proceed to arbitration
```

**Mediation Advantages:**
- Faster than litigation
- Cheaper than litigation
- Confidential
- Preserves relationship
- Flexible solutions

### 7.3 Arbitration Phase

**Arbitration Process:**
```
1. File arbitration demand with AAA
2. Select arbitrator (single or panel)
3. Exchange written statements
4. Hearing (1-2 days typically)
5. Arbitrator issues award
6. Award is binding and enforceable
```

**Arbitration Advantages:**
- Final and binding
- Faster than litigation
- Confidential
- Enforced internationally

### 7.4 Litigation Phase

**When Litigation is Necessary:**
- Arbitration award needs enforcement
- Injunctive relief needed
- Criminal activity involved
- Arbitration agreement invalid

---

## PART 8: SAMPLE DISPUTE SCENARIOS

### Scenario 1: Provider Claims Revenue Underpayment

**Provider's Claim:**
"You reported 1M tokens consumed, but our logs show 1.2M tokens"

**Resolution Process:**
```
1. Reseller provides detailed usage logs
2. Provider audits Reseller's records
3. Discrepancy identified: 200K tokens
4. Reseller owes: 200K × $0.0001 × 85% = $17
5. Payment made within 30 days
6. If > 5% discrepancy: Reseller covers audit costs
```

### Scenario 2: Reseller Claims Service Failure

**Reseller's Claim:**
"Provider API was down 6 hours, causing revenue loss"

**Resolution Process:**
```
1. Reseller provides evidence of downtime
2. Provider verifies logs
3. Downtime confirmed: 6 hours
4. Monthly uptime: 98.5% (below 99.5% SLA)
5. Service credit: 10% of monthly fees
6. Reseller receives credit on next invoice
```

### Scenario 3: Unauthorized Use Dispute

**Provider's Claim:**
"Developer used API to train competing model"

**Resolution Process:**
```
1. Provider provides evidence
2. Reseller investigates developer
3. Violation confirmed
4. Developer account terminated
5. Provider compensated for damages
6. Reseller implements additional monitoring
```

---

## PART 9: CHECKLIST: BEFORE SIGNING PROVIDER AGREEMENT

### Legal Review
- [ ] Have attorney review agreement
- [ ] Understand all financial terms
- [ ] Understand all termination clauses
- [ ] Understand all liability limitations
- [ ] Understand all confidentiality obligations

### Financial Terms
- [ ] Revenue share percentage agreed
- [ ] Payment schedule confirmed
- [ ] Minimum revenue guarantee (if any)
- [ ] Audit rights understood
- [ ] Currency and payment method specified

### Operational Terms
- [ ] Service levels defined (uptime SLA)
- [ ] Support response times defined
- [ ] Escalation procedures documented
- [ ] Reporting requirements clear
- [ ] Integration timeline agreed

### Compliance Terms
- [ ] Export control compliance confirmed
- [ ] Data protection agreement in place
- [ ] Insurance requirements met
- [ ] Regulatory compliance verified
- [ ] Prohibited use policy understood

### Risk Management
- [ ] Liability caps understood
- [ ] Indemnification obligations clear
- [ ] Termination rights preserved
- [ ] Dispute resolution process agreed
- [ ] Force majeure clause included

---

## PART 10: RED FLAGS IN PROVIDER AGREEMENTS

### Terms to Avoid or Negotiate

**Exclusive Arrangement:**
- ❌ "You can only resell our API"
- ✅ Negotiate: "Non-exclusive arrangement"

**Unlimited Liability:**
- ❌ "Provider liable for all damages"
- ✅ Negotiate: "Liability capped at 12 months fees"

**Unilateral Termination:**
- ❌ "Provider can terminate anytime without cause"
- ✅ Negotiate: "90-day notice required"

**Unreasonable Minimum Revenue:**
- ❌ "$100,000 minimum monthly revenue"
- ✅ Negotiate: "$5,000 minimum, waived first 6 months"

**Restrictive Non-Compete:**
- ❌ "Cannot resell competing APIs"
- ✅ Negotiate: "Cannot use API to build competing product"

**Automatic Renewal:**
- ❌ "Automatically renews; hard to cancel"
- ✅ Negotiate: "Automatic renewal with 90-day opt-out"

**Unreasonable Audit Rights:**
- ❌ "Provider can audit anytime, unlimited"
- ✅ Negotiate: "Annual audit, at Provider's expense"

**Broad Indemnification:**
- ❌ "Reseller indemnifies for all claims"
- ✅ Negotiate: "Reseller indemnifies for own breaches only"

---

## PART 11: NEGOTIATION STRATEGY

### 11.1 Initial Approach

**Email Template:**
```
Subject: Partnership Discussion - TokenGateway x [Provider]

Hi [Name],

We're excited about the opportunity to partner with [Provider] and 
bring Claude/Cohere/[Model] to thousands of developers through TokenGateway.

We've reviewed your standard partnership agreement and would like to 
discuss a few terms:

1. Revenue Share: We'd like to discuss 80/20 (us/you) vs. 85/15
2. Minimum Revenue: We'd like to waive for first 6 months
3. Termination: We'd like 90-day notice instead of 30-day
4. Audit Rights: We'd like to limit to annual audits

We believe these adjustments will accelerate growth for both parties.

Would you be available for a call next week to discuss?

Best regards,
[Your Name]
```

### 11.2 Negotiation Tactics

**Prioritize:**
- Focus on 3-5 key terms
- Don't negotiate everything
- Know your walk-away points

**Compromise:**
- Offer concessions on less important terms
- Request concessions on important terms
- Find win-win solutions

**Document:**
- Get everything in writing
- Use amendment letters if needed
- Have attorney review final version

**Timeline:**
- Don't rush negotiations
- Build rapport with provider
- Allow time for legal review

---

## PART 12: ONGOING COMPLIANCE

### 12.1 Monthly Obligations

- [ ] Verify revenue calculations
- [ ] Prepare settlement report
- [ ] Process provider payment
- [ ] Monitor API usage
- [ ] Check for compliance violations

### 12.2 Quarterly Obligations

- [ ] Review agreement compliance
- [ ] Audit customer usage
- [ ] Check for prohibited use
- [ ] Review security measures
- [ ] Update compliance documentation

### 12.3 Annual Obligations

- [ ] Renew insurance certificates
- [ ] Conduct security audit
- [ ] Review and update ToS
- [ ] Renew DPA if needed
- [ ] Negotiate renewal terms

### 12.4 As-Needed Obligations

- [ ] Respond to data subject requests
- [ ] Report security breaches
- [ ] Handle disputes
- [ ] Update compliance procedures
- [ ] Notify of material changes

---

## SUMMARY

**Key Takeaways:**

1. **Provider Agreement is Critical**
   - Defines revenue share and payment terms
   - Limits liability and indemnification
   - Specifies compliance requirements
   - Includes termination and dispute resolution

2. **You Need Multiple Agreements**
   - Provider Partnership Agreement
   - Developer Terms of Service
   - Data Processing Agreement (GDPR/CCPA)
   - Privacy Policy

3. **Get Legal Review**
   - Have attorney review all agreements
   - Understand all terms before signing
   - Negotiate unfavorable terms
   - Document all changes

4. **Compliance is Ongoing**
   - Monthly revenue verification
   - Quarterly compliance audits
   - Annual insurance renewal
   - Continuous monitoring

5. **Dispute Resolution is Structured**
   - Negotiation (30 days)
   - Mediation (30-60 days)
   - Arbitration (final)
   - Litigation (only if necessary)

**Next Steps:**
1. Consult with business attorney
2. Prepare initial provider agreement
3. Draft developer terms of service
4. Implement compliance procedures
5. Start provider outreach with confidence
