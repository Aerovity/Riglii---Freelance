import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">Riglii User Terms of Service</CardTitle>
          <p className="text-muted-foreground">(Freelancer Agreement)</p>
          <div className="flex justify-between text-sm text-muted-foreground mt-4">
            <span>Last Updated: [6/10/2025]</span>
            <span>Effective Date: [6/10/2025]</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Welcome to Riglii, an Algerian freelance platform connecting Clients ("Users") and Freelancers ("Service
              Providers"). By using Riglii, you agree to these legally binding Terms of Service. Riglii does not process
              online payments; all payment arrangements are made directly between Users and Freelancers.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Definitions</h2>
            <div className="space-y-2">
              <p>
                <strong>"Commercial Form":</strong> A binding agreement between User and Freelancer detailing project
                scope, deliverables, timeline, and payment terms.
              </p>
              <p>
                <strong>"Support":</strong> Riglii's dispute resolution team at [Support Email/Contact].
              </p>
            </div>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Commercial Form & Agreement</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Freelancers must submit a Commercial Form for User approval before work begins.</li>
              <li>
                By signing the Commercial Form, the User:
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Agrees to the project terms</li>
                  <li>Commits to the payment structure (25% upfront, 75% upon delivery)</li>
                  <li>Acknowledges that cancellation requests must be submitted to Support</li>
                </ul>
              </li>
            </ul>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Payment Terms</h2>

            <h3 className="text-lg font-medium mb-2">4.1 Payment Structure</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>
                <strong>25% upfront:</strong> Paid by User before work begins.
              </li>
              <li>
                <strong>75% upon delivery:</strong> Paid by User after accepting final deliverables.
              </li>
              <li>
                <strong>Payment Method:</strong> Chosen mutually (bank transfer, cash, etc.). Riglii is not responsible
                for payment processing.
              </li>
            </ul>

            <h3 className="text-lg font-medium mb-2">4.2 Payment Disputes</h3>
            <div className="space-y-3">
              <div>
                <p className="font-medium">Non-payment by User:</p>
                <p className="text-muted-foreground">
                  If a User refuses to pay after work is completed per the Commercial Form:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground">
                  <li>Freelancer contacts Support with proof of completed work.</li>
                  <li>Riglii investigates and may mediate.</li>
                  <li>If unresolved, Freelancer may escalate to legal authorities.</li>
                </ul>
              </div>
              <div>
                <p className="font-medium">Refunds for Undelivered Work:</p>
                <p className="text-muted-foreground">
                  If the Freelancer fails to deliver or breaches the Commercial Form:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground">
                  <li>User contacts Support with evidence.</li>
                  <li>Riglii verifies and facilitates a full/partial refund as agreed in the Commercial Form.</li>
                </ul>
              </div>
            </div>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Dispute Resolution</h2>
            <div className="space-y-2">
              <p>
                <strong>Step 1:</strong> Contact Support within 7 days of issue. Provide:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground">
                <li>Commercial Form</li>
                <li>Communication logs</li>
                <li>Proof of payment/work</li>
              </ul>
              <p>
                <strong>Step 2:</strong> Riglii will mediate within 14 days.
              </p>
              <p>
                <strong>Step 3:</strong> If mediation fails, parties may pursue legal action under Algerian law.
              </p>
            </div>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Cancellation Policy</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                <strong>Before Work Starts:</strong> User may cancel by contacting Support; 25% payment is void if not
                yet transferred.
              </li>
              <li>
                <strong>After Work Starts:</strong> Cancellation requires mutual agreement or Support intervention. The
                25% upfront is non-refundable unless Freelancer fails to start work.
              </li>
            </ul>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Limitations of Liability</h2>
            <p className="text-muted-foreground mb-2">Riglii is not liable for:</p>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>Payment disputes between Users/Freelancers</li>
              <li>Quality or delivery of work</li>
              <li>Breaches of the Commercial Form</li>
            </ul>
            <p className="text-muted-foreground font-medium mt-2">All transactions are at your own risk.</p>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Governing Law</h2>
            <p className="text-muted-foreground">
              These Terms are governed by Algerian law. Any legal actions must be filed in Algerian courts.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Amendments</h2>
            <p className="text-muted-foreground">
              Riglii may update these Terms. Continued use after changes constitutes acceptance.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Contact</h2>
            <p className="text-muted-foreground">
              For disputes or queries:
              <br />
              Email:{" "}
              <a href="mailto:support@riglii.dz" className="text-primary hover:underline">
                support@riglii.dz
              </a>
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  )
}
