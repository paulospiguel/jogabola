import { describe, expect, it } from "vitest";
import {
  decidePayoutUpdate,
  maskPayoutSettings,
} from "@/lib/payout-reconfigure";

const stored = {
  id: 1,
  teamId: 7,
  stripeEnabled: false,
  stripeAccountId: "acct_old",
  mbwayEnabled: false,
  mbwayPhone: "912345678",
  mbwayName: "Antigo Dono",
  cashEnabled: true,
  cashInstructions: "Paga no campo",
  transferEnabled: false,
  transferIban: "PT50000201231234567890154",
  transferName: "Antigo Dono",
  payoutReconfigureRequiredAt: new Date("2026-11-27T10:00:00Z"),
  createdAt: null,
  updatedAt: null,
};

describe("maskPayoutSettings", () => {
  it("passes null and unflagged rows through", () => {
    expect(maskPayoutSettings(null)).toBeNull();
    const clean = { ...stored, payoutReconfigureRequiredAt: null };
    expect(maskPayoutSettings(clean)).toEqual({
      ...clean,
      payoutReconfigureRequired: false,
    });
  });

  it("hides payout details and disables online methods while flagged", () => {
    expect(maskPayoutSettings({ ...stored, mbwayEnabled: true })).toMatchObject(
      {
        payoutReconfigureRequired: true,
        stripeEnabled: false,
        stripeAccountId: null,
        mbwayEnabled: false,
        mbwayPhone: null,
        mbwayName: null,
        transferEnabled: false,
        transferIban: null,
        transferName: null,
        cashEnabled: true,
        cashInstructions: "Paga no campo",
      },
    );
  });
});

describe("decidePayoutUpdate", () => {
  it("allows anything when the team is not flagged", () => {
    const payload = { mbwayEnabled: true, mbwayPhone: "", mbwayName: "" };
    expect(
      decidePayoutUpdate({ flagged: false, isOwner: false, payload }),
    ).toEqual({ allowed: true, clearFlag: false, payload });
  });

  it("refuses staff enabling any online method while flagged", () => {
    for (const payload of [
      { mbwayEnabled: true, mbwayPhone: "911111111", mbwayName: "Nova" },
      { transferEnabled: true, transferIban: "PT50", transferName: "Nova" },
      { stripeEnabled: true },
    ]) {
      expect(
        decidePayoutUpdate({ flagged: true, isOwner: false, payload }),
      ).toEqual({ allowed: false });
    }
  });

  it("refuses staff typing new payout details while flagged", () => {
    expect(
      decidePayoutUpdate({
        flagged: true,
        isOwner: false,
        payload: { mbwayPhone: "911111111" },
      }),
    ).toEqual({ allowed: false });
  });

  it("lets staff save cash while flagged and keeps stale details stored", () => {
    expect(
      decidePayoutUpdate({
        flagged: true,
        isOwner: false,
        payload: {
          cashEnabled: false,
          mbwayEnabled: false,
          mbwayPhone: "",
          mbwayName: "",
          transferIban: "",
          stripeAccountId: undefined,
        },
      }),
    ).toEqual({
      allowed: true,
      clearFlag: false,
      payload: { cashEnabled: false, mbwayEnabled: false },
    });
  });

  it("refuses the owner enabling a method without fresh details", () => {
    expect(
      decidePayoutUpdate({
        flagged: true,
        isOwner: true,
        payload: { mbwayEnabled: true, mbwayPhone: "911111111", mbwayName: "" },
      }),
    ).toEqual({ allowed: false });
    expect(
      decidePayoutUpdate({
        flagged: true,
        isOwner: true,
        payload: { transferEnabled: true, transferIban: "PT50" },
      }),
    ).toEqual({ allowed: false });
  });

  it("keeps Stripe disabled while flagged, even for the owner", () => {
    expect(
      decidePayoutUpdate({
        flagged: true,
        isOwner: true,
        payload: { stripeEnabled: true, stripeAccountId: "acct_new" },
      }),
    ).toEqual({ allowed: false });
  });

  it("lets the owner save fresh details and clears the flag", () => {
    const payload = {
      mbwayEnabled: true,
      mbwayPhone: "911111111",
      mbwayName: "Novo Dono",
      transferEnabled: false,
      transferIban: "",
      stripeAccountId: "acct_should_drop",
    };
    expect(
      decidePayoutUpdate({ flagged: true, isOwner: true, payload }),
    ).toEqual({
      allowed: true,
      clearFlag: true,
      payload: {
        mbwayEnabled: true,
        mbwayPhone: "911111111",
        mbwayName: "Novo Dono",
        transferEnabled: false,
      },
    });
  });

  it("does not clear the flag on an owner save without fresh details", () => {
    expect(
      decidePayoutUpdate({
        flagged: true,
        isOwner: true,
        payload: { cashEnabled: true, mbwayPhone: "" },
      }),
    ).toEqual({
      allowed: true,
      clearFlag: false,
      payload: { cashEnabled: true },
    });
  });
});
