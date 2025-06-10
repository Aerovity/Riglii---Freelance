import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

export default function FreelancerAgreementPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">Freelancer Agreement Contract</CardTitle>
          <p className="text-lg text-muted-foreground">Riglii Platform Registration</p>
          <Badge variant="outline" className="w-fit mx-auto mt-2">
            Effective Date: [Date]
          </Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          <section className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">This Agreement ("Agreement") is entered into between:</p>
            <div className="space-y-1">
              <p>
                <strong>Freelancer:</strong> [Full Legal Name], [ID/Passport Number], [Address] ("Freelancer")
              </p>
              <p>
                <strong>Riglii:</strong> Represented by its legal entity [Company Name/Details], Algeria ("Platform")
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground mb-2">By signing this Agreement, the Freelancer:</p>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>Agrees to comply with Riglii's User Terms of Service (available at [Link]).</li>
              <li>Confirms they are legally eligible to work in Algeria.</li>
              <li>
                Acknowledges Riglii does not process payments; all transactions are managed directly between Freelancer
                and Client.
              </li>
            </ul>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Freelancer Obligations</h2>
            <p className="text-muted-foreground mb-3">The Freelancer agrees to:</p>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">a) Project Execution</h3>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>
                    Submit a Commercial Form (detailing scope, timeline, deliverables, and payment terms) for Client
                    approval before starting work.
                  </li>
                  <li>Begin work only after receiving the 25% upfront payment.</li>
                  <li>Deliver work as specified in the Commercial Form.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">b) Payment Compliance</h3>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>
                    Adhere to Riglii's payment structure:
                    <ul className="list-disc pl-6 mt-1">
                      <li>25% upfront before work begins.</li>
                      <li>75% upon delivery after Client acceptance.</li>
                    </ul>
                  </li>
                  <li>Resolve payment disputes exclusively through Riglii Support.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">c) Professional Conduct</h3>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>Provide accurate qualifications, portfolio, and contact information.</li>
                  <li>Communicate promptly with Clients and Riglii Support.</li>
                  <li>Maintain confidentiality of Client information.</li>
                </ul>
              </div>
            </div>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Payment & Dispute Resolution</h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">a) Payment Method</h3>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>Freelancer and Client mutually agree on payment method (bank transfer, cash, etc.).</li>
                  <li>Riglii is not liable for payment delays, fraud, or disputes.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">b) Dispute Process</h3>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium">Non-payment by Client:</p>
                    <ul className="list-disc pl-6 text-muted-foreground">
                      <li>
                        Contact Riglii Support with:
                        <ul className="list-disc pl-6 mt-1">
                          <li>Signed Commercial Form.</li>
                          <li>Proof of completed work (e.g., screenshots, files).</li>
                        </ul>
                      </li>
                      <li>If unresolved after mediation, Freelancer may escalate to Algerian legal authorities.</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium">Project Cancellation:</p>
                    <p className="text-muted-foreground">
                      If Client cancels after work starts, the 25% upfront is non-refundable unless work was
                      undelivered.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Intellectual Property</h2>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>Freelancer retains IP rights until full payment is received.</li>
              <li>Upon full payment, ownership transfers to the Client per the Commercial Form.</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Termination</h2>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>Either party may terminate this Agreement with 30 days' notice.</li>
              <li>
                Riglii may suspend accounts for:
                <ul className="list-disc pl-6 mt-1">
                  <li>Breach of this Agreement.</li>
                  <li>Fraudulent activity.</li>
                  <li>Recurring disputes.</li>
                </ul>
              </li>
            </ul>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Liability & Indemnification</h2>
            <p className="text-muted-foreground mb-2">Freelancer agrees:</p>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>
                Riglii is not responsible for:
                <ul className="list-disc pl-6 mt-1">
                  <li>Quality of work delivered.</li>
                  <li>Payment disputes or losses.</li>
                  <li>Client misconduct.</li>
                </ul>
              </li>
              <li>To indemnify Riglii against claims arising from their work.</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Governing Law</h2>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>This Agreement is governed by Algerian law.</li>
              <li>Legal disputes must be filed in Algerian courts.</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Signatures</h2>
            <div className="grid md:grid-cols-2 gap-6 mt-4">
              <div className="space-y-3">
                <h4 className="font-medium">Freelancer:</h4>
                <div className="space-y-2 text-sm">
                  <p>Name: _________________________</p>
                  <p>Signature: ______________________</p>
                  <p>Date: __________________________</p>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium">Riglii:</h4>
                <div className="space-y-2 text-sm">
                  <p>Authorized Representative: _______________</p>
                  <p>Signature: ______________________</p>
                  <p>Date: __________________________</p>
                </div>
              </div>
            </div>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold mb-3">Attachments</h2>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>[Riglii User Terms of Service]</li>
              <li>[Commercial Form Template]</li>
            </ul>
          </section>

          <section className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Note:</h3>
            <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
              <li>
                <strong>Commercial Form:</strong> Must be signed by the Client before starting work.
              </li>
              <li>
                <strong>Support Contact:</strong> disputes@riglii.dz / [+213 XXX XX XX XX]
              </li>
              <li>Freelancers must keep records of all transactions and communication</li>
            </ul>
          </section>
        </CardContent>
      </Card>
    </div>
  )
}
