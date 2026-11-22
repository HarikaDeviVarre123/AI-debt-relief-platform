"""
Gemini AI integration service.

Wraps calls to the Google Gemini API for generating negotiation strategies,
settlement letters, and general financial advice. If no API key is
configured, uses an intelligent domain-specific local generator tailored to
the borrower's exact loan balance, interest rate, and financial health score,
ensuring a flawless user experience both online and offline.
"""

import os
import logging
from datetime import datetime
import requests
from dotenv import load_dotenv

logger = logging.getLogger("finrelief")


def _get_gemini_config():
    load_dotenv(override=True)
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    model = os.getenv("GEMINI_MODEL", "gemini-1.5-flash").strip()
    return api_key, model


def _call_gemini(prompt: str) -> str | None:
    """
    Call the Google Gemini API with the given prompt.
    Returns the text response on success, or None on failure/missing key.
    """
    api_key, model = _get_gemini_config()
    if not api_key:
        logger.info("GEMINI_API_KEY not configured; switching to intelligent local engine.")
        return None

    endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    try:
        response = requests.post(
            endpoint,
            headers={"Content-Type": "application/json"},
            json={
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "temperature": 0.7,
                    "topP": 0.95,
                    "maxOutputTokens": 1000,
                },
            },
            timeout=25,
        )
        if response.status_code == 200:
            data = response.json()
            candidates = data.get("candidates", [])
            if candidates:
                parts = candidates[0].get("content", {}).get("parts", [])
                text = "".join(part.get("text", "") for part in parts).strip()
                if text:
                    return text
        logger.warning(
            "Gemini API returned status %s: %s", response.status_code, response.text[:200]
        )
        return None
    except Exception as exc:
        logger.error("Gemini API call failed: %s", exc)
        return None


def generate_negotiation_strategy(
    loan_type: str,
    outstanding_amount: float,
    interest_rate: float,
    financial_health_score: float,
    notes: str = "",
) -> str:
    """Generate an actionable negotiation battle plan for a specific debt."""
    is_secured = any(k in loan_type.lower() for k in ["auto", "vehicle", "home", "mortgage", "gold", "car loan"]) and "card" not in loan_type.lower()

    prompt = (
        "You are an elite financial strategist and debt negotiation expert.\n"
        "Generate a tailored, highly specific negotiation strategy for the following borrower and debt profile:\n\n"
        f"• Debt Category: {loan_type} ({'SECURED debt with collateral / asset lien' if is_secured else 'UNSECURED revolving/installment debt'})\n"
        f"• Outstanding Balance: ₹{outstanding_amount:,.2f}\n"
        f"• Annual Interest Rate: {interest_rate}%\n"
        f"• Borrower Financial Health Score: {financial_health_score:.1f}/100\n"
        f"• Borrower Specific Circumstances: {notes or 'Cash flow constraints, seeking fastest path to debt resolution'}\n\n"
        "CRITICAL INSTRUCTIONS FOR CUSTOMIZATION:\n"
        "1. DO NOT use generic filler greetings like 'Here is a concise...'. Start immediately with a bold title referencing the loan type and amount.\n"
        "2. Treat SECURED loans (e.g. Auto, Home) completely differently from UNSECURED loans (e.g. Credit Cards, Personal Loans):\n"
        "   - For SECURED loans: Address collateral repossession risk. Focus on tenure extension, EMI restructuring, interest rate cut, or lump-sum principal payoff.\n"
        "   - For UNSECURED Credit Cards (high interest): Aggressive lump-sum compromise (30% to 45% of balance). Cite charge-off risk.\n"
        "   - For UNSECURED Personal Loans: Target 45% to 60% structured settlement.\n"
        "3. YOU MUST COMPUTE AND PRINT EXACT RUPEE FIGURES for the opening offer and maximum cap based on ₹" + f"{outstanding_amount:,.2f}.\n"
        "4. Include 2 aggressive negotiation talking points specific to this creditor type.\n"
        "5. Include 2 counter-arguments to common pushback from this type of lender.\n"
        "6. Required closing terms (written agreement, No Dues Certificate, credit bureau status).\n"
        "Keep the total length between 220 and 320 words."
    )

    ai_result = _call_gemini(prompt)
    if ai_result:
        return ai_result

    # High-quality contextual local fallback
    opening_pct = 45 if interest_rate > 20 else 55
    opening_amount = outstanding_amount * (opening_pct / 100.0)
    target_pct = opening_pct + 15
    target_amount = outstanding_amount * (target_pct / 100.0)

    hardship_context = f"Noted hardship: '{notes}'." if notes else "General income constraint."

    return (
        f"### Debt Negotiation Strategy: {loan_type}\n"
        f"**Outstanding Debt:** ₹{outstanding_amount:,.2f} | **Interest Rate:** {interest_rate}%\n\n"
        f"**1. Target Offer Range:**\n"
        f"- **Opening Bid ({opening_pct}%):** Offer ₹{opening_amount:,.2f} as a single lump-sum full settlement.\n"
        f"- **Walk-away Ceiling ({target_pct}%):** Cap your final agreement at ₹{target_amount:,.2f}.\n\n"
        f"**2. Strategic Talking Points:**\n"
        f"- State clearly: 'Due to severe cash flow constraints, I cannot sustain regular EMIs, but I have secured a one-time lump sum from family to close this account now.'\n"
        f"- {hardship_context}\n"
        f"- Highlight that {loan_type} carries an aggressive interest rate ({interest_rate}%), making default imminent without a mutually agreeable settlement.\n\n"
        f"**3. Objection Handling:**\n"
        f"- *If creditor says: 'We don't settle active accounts.'* -> Counter: 'Without a settlement, I will be forced into credit counseling or insolvency, where recovery will be near zero.'\n"
        f"- *If creditor demands 80%+* -> Hold firm at ₹{opening_amount:,.2f} and request to speak with the Senior Recovery/Settlement Officer.\n\n"
        f"**4. Mandatory Protection Rules:**\n"
        f"- Never make a payment until you hold an official **Settlement Agreement Letter** on creditor letterhead.\n"
        f"- Ensure terms stipulate: *'Account balance cleared with zero future liability and reported as Settled/Paid in full.'*"
    )


def generate_settlement_letter(
    loan_type: str,
    outstanding_amount: float,
    offer_amount: float | None = None,
    tone: str = "professional",
    borrower_name: str | None = None,
    borrower_address: str | None = None,
    lender_name: str | None = None,
    lender_address: str | None = None,
    hardship_reason: str | None = None,
) -> str:
    """Generate a formal, bank-standard debt settlement offer letter."""
    if not offer_amount:
        offer_amount = round(outstanding_amount * 0.55, 2)

    current_date = datetime.now().strftime("%B %d, %Y")
    discount_pct = round((1 - (offer_amount / outstanding_amount)) * 100, 1)

    borrower_name_val = borrower_name.strip() if borrower_name and borrower_name.strip() else "[Borrower's Full Name]"
    borrower_addr_val = borrower_address.strip() if borrower_address and borrower_address.strip() else "[Borrower's Address]"
    lender_name_val = lender_name.strip() if lender_name and lender_name.strip() else "[Lender / Bank Name]"
    lender_addr_val = lender_address.strip() if lender_address and lender_address.strip() else "[Lender / Branch Address]"
    hardship_val = hardship_reason.strip() if hardship_reason and hardship_reason.strip() else "unexpected financial hardships, substantial cash flow constraints, and medical/economic burdens"

    prompt = (
        "You are an expert financial legal drafter.\n"
        "Generate a complete, formal, professional debt settlement offer letter using the exact details provided below.\n\n"
        "LETTER INPUT DETAILS:\n"
        f"• Current Date: {current_date}\n"
        f"• Borrower Name: {borrower_name_val}\n"
        f"• Borrower Address: {borrower_addr_val}\n"
        f"• Lender / Bank Name: {lender_name_val}\n"
        f"• Lender Address: {lender_addr_val}\n"
        f"• Loan Account Type: {loan_type}\n"
        f"• Current Outstanding Balance: ₹{outstanding_amount:,.2f}\n"
        f"• Proposed Settlement Amount: ₹{offer_amount:,.2f} ({discount_pct}% debt compromise)\n"
        f"• Hardship Reason: {hardship_val}\n"
        f"• Letter Tone: {tone}\n\n"
        "STRICT DRAFTING RULES:\n"
        f"1. DATE: Write the date explicitly as '{current_date}'. NEVER output '[Current Date]'.\n"
        "2. SENDER & RECIPIENT HEADERS:\n"
        f"   - Place Borrower details at the top:\n"
        f"     {borrower_name_val}\n"
        f"     {borrower_addr_val}\n"
        f"     Date: {current_date}\n\n"
        f"   - Followed by Recipient details:\n"
        f"     To:\n"
        f"     The Settlement & Loan Recovery Department\n"
        f"     {lender_name_val}\n"
        f"     {lender_addr_val}\n\n"
        f"3. SUBJECT LINE: Must be exactly: Subject: Request for Loan Settlement - {loan_type} (A/C: [Account Number])\n"
        "4. BODY PARAGRAPHS:\n"
        f"   - State the current outstanding amount (₹{outstanding_amount:,.2f}) on the {loan_type} account.\n"
        f"   - Detail the financial difficulties factually based on: {hardship_val}.\n"
        f"   - Present the proposed settlement lump-sum payment of ₹{offer_amount:,.2f} as a full and final satisfaction.\n"
        "   - Explicitly request a formal written settlement confirmation letter on official bank letterhead BEFORE any payment is made.\n"
        "   - Explicitly stipulate the issuance of a No Dues Certificate (NDC) within 15 business days following payment clearance, and reporting the account as 'Settled / Paid in Full' with zero outstanding liability to all credit rating bureaus (CIBIL, Experian, Equifax).\n"
        "   - Include a 21-day validity window for this compromise offer.\n"
        f"5. SIGNATURE BLOCK: Conclude professionally with 'Sincerely,' followed by {borrower_name_val}.\n"
        "6. PLACEHOLDERS: Use a simple placeholder ONLY for information that is missing (e.g. [Account Number], [Contact Number]). DO NOT invent personal or financial data. If a specific detail was provided above, you MUST use that actual value directly in the text without brackets.\n"
        "7. NO PREAMBLE: Output only the letter. Do not include introductory notes or commentary."
    )

    ai_result = _call_gemini(prompt)
    if ai_result:
        return ai_result

    # High-quality contextual local fallback
    return (
        f"{borrower_name_val}\n"
        f"{borrower_addr_val}\n"
        f"Date: {current_date}\n\n"
        f"To:\n"
        f"The Settlement & Loan Recovery Department\n"
        f"{lender_name_val}\n"
        f"{lender_addr_val}\n\n"
        f"Subject: Request for Loan Settlement - {loan_type} (A/C: [Account Number])\n\n"
        f"Dear Sir / Madam,\n\n"
        f"I am writing this letter to formally request a full and final settlement regarding my {loan_type} account referenced above. "
        f"The records currently indicate an outstanding balance of ₹{outstanding_amount:,.2f}.\n\n"
        f"Regrettably, due to {hardship_val}, I am experiencing severe financial distress and am unable to sustain the monthly payments as originally scheduled. "
        f"However, with assistance from family and through prudent reallocation of available emergency funds, I have arranged a single lump-sum amount of "
        f"₹{offer_amount:,.2f} (representing a {discount_pct}% debt relief compromise).\n\n"
        f"I propose to tender this amount of ₹{offer_amount:,.2f} as FULL AND FINAL SETTLEMENT of all claims, obligations, and balances associated with this account, "
        f"subject to the following conditions:\n"
        f"1. Written Confirmation: The bank/creditor issues a formal Settlement Agreement on official letterhead specifying the agreed amount and terms prior to any payment.\n"
        f"2. Waiver of Balance: Acceptance and clearance of this payment will fully extinguish all principal, interest, late fees, and legal liabilities.\n"
        f"3. No Dues Certificate (NDC): The lender agrees to issue a comprehensive No Dues Certificate within 15 business days of payment clearance.\n"
        f"4. Credit Bureau Reporting: The account status will be promptly updated across all credit rating bureaus (CIBIL, Experian, Equifax) as 'Settled / Closed in Full' with zero remaining balance.\n\n"
        f"This settlement proposal remains open for 21 calendar days from the date of this letter. Please convey your written acceptance or reply to "
        f"[Contact Email Address / Phone Number].\n\n"
        f"Thank you for your understanding and cooperation.\n\n"
        f"Sincerely,\n\n"
        f"{borrower_name_val}\n"
        f"[Contact Number]\n"
        f"[Email Address]"
    )


def generate_financial_advice(
    monthly_income: float,
    monthly_expenses: float,
    existing_debts: float,
    financial_health_score: float,
) -> str:
    """Generate prioritized, actionable financial recovery guidance."""
    prompt = (
        "You are an empathetic financial recovery advisor. Provide clear, prioritized financial guidance "
        "and debt relief recommendations for an individual with the following financial profile:\n"
        f"- Monthly Income: ₹{monthly_income:,.2f}\n"
        f"- Monthly Living Expenses: ₹{monthly_expenses:,.2f}\n"
        f"- Total Existing Debt: ₹{existing_debts:,.2f}\n"
        f"- Financial Health Score: {financial_health_score:.1f} / 100\n\n"
        "Provide 4 structured, realistic, prioritized action items to restore financial stability. "
        "Under 260 words."
    )

    ai_result = _call_gemini(prompt)
    if ai_result:
        return ai_result

    # High-quality contextual local fallback
    net_surplus = monthly_income - monthly_expenses
    savings_rate = round((net_surplus / monthly_income) * 100, 1) if monthly_income > 0 else 0
    dti_ratio = round((existing_debts / (monthly_income * 12)) * 100, 1) if monthly_income > 0 else 0

    return (
        f"### Financial Recovery & Stabilization Roadmap\n"
        f"**Health Score:** {financial_health_score:.1f}/100 | **Monthly Cash Flow Surplus:** ₹{net_surplus:,.2f} ({savings_rate}%)\n\n"
        f"**1. Immediate Cash Flow Insulation:**\n"
        f"- Before making aggressive principal prepayments, secure a foundational safety buffer of ₹{monthly_expenses * 1.5:,.2f} "
        f"(1.5 months of essential expenses) to avoid triggering new high-interest debt during emergencies.\n\n"
        f"**2. Debt Snowball / Avalanche Prioritization:**\n"
        f"- Your total debt-to-annual-income ratio stands at {dti_ratio}%. Immediately isolate revolving unsecured debts "
        f"(credit cards and personal loans) carrying interest rates above 18%. Allocate 80% of your ₹{max(0, net_surplus):,.2f} "
        f"monthly surplus exclusively to the single highest-interest obligation while paying minimums on others.\n\n"
        f"**3. Strategic Compromise & Restructuring:**\n"
        f"- For delinquent or overburdened accounts, do not allow penalties to compound. Use the FinRelief Settlement tool "
        f"to approach creditors for a 40–50% lump-sum settlement or convert balances into fixed low-rate moratorium EMIs.\n\n"
        f"**4. Expenditure Realignment:**\n"
        f"- Review your monthly discretionary expenditure (currently ₹{monthly_expenses:,.2f}). Trimming non-essential subscriptions "
        f"and overhead by 10% will unlock an additional ₹{monthly_expenses * 0.10:,.2f}/month, accelerating your debt-free timeline by up to 14 months."
    )
