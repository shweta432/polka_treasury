import dotenv from "dotenv";
import { BigNumber } from "bignumber.js";
import { ApiPromise, WsProvider, Keyring } from '@polkadot/api';

dotenv.config();

(async () => {
    try {
        const provider = new WsProvider(process.env.NODE_NETWORK);
        const api = await ApiPromise.create({ provider: provider });
        querySystemInfo(api);
        getTreasuryBalance(api);
        getAccountBalance(api);
        getTreasuryProposals(api);
        getTreasuryProposalsCount(api)
        submitTreasuryProposal(api);
    } catch (error) {
        console.log("error while making connection: ", error);
    }
})();

async function querySystemInfo(api) {
    try {
        const [chain, nodeName, nodeVersion] = await Promise.all([
            api.rpc.system.chain(),
            api.rpc.system.name(),
            api.rpc.system.version()
        ]);

        console.log(`Chain: ${chain}`);
        console.log(`Node Name: ${nodeName}`);
        console.log(`Node Version: ${nodeVersion}`);
    } catch (error) {
        console.log("error while querySystemInfo: ", error);
    }
};

async function getTreasuryBalance(api) {
    try {

        // Retrieve the balance of the Treasury storage item
        const treasuryBalance = await api.query.treasury.inactive();
        console.log(`\nTreasury Balance: ${new BigNumber(treasuryBalance).dividedBy(10 ** process.env.DECIMALS).toString()}`);

    } catch (error) {
        console.log("error while getTreasuryBalance: ", error);
    }
}

async function submitTreasuryProposal(api) {
    try {
        const keyring = new Keyring({ type: 'ed25519' });
        const sender = keyring.addFromUri(process.env.SENDER_MNEMONIC);

        const proposal = api.tx.treasury.proposeSpend(
            new BigNumber(1).multipliedBy(10 ** process.env.DECIMALS).toString(),
            process.env.ACCOUNT_ADDRESS, // Beneficiary address
        );

        const proposalHash = await proposal.signAndSend(sender);
        console.log(`\nProposal submitted with hash: ${proposalHash}`);

    } catch (error) {
        console.error("error while submitTreasuryProposal: ", error);
    }

}

async function getAccountBalance(api) {
    try {

        // Retrieve the account information
        let balance = await api?.derive.balances.all(process.env.ACCOUNT_ADDRESS);
        balance = balance.availableBalance;
        console.log(`\nBalance of ${process.env.ACCOUNT_ADDRESS}: ${new BigNumber(balance.toString()).dividedBy(10 ** process.env.DECIMALS).toString()}`);

    } catch (error) {
        console.log("error while getAccountBalance: ", error);
    }
}

async function getTreasuryProposalsCount(api) {
    try {
        const proposalsCount = await api.query.treasury.proposalCount();
        console.log("\nTreasury Proposals Count :", proposalsCount.toJSON());
    } catch (error) {
        console.log("error while getTreasuryProposals: ", error);
    }
}

async function getTreasuryProposals(api) {
    try {

        const proposalIndex = 1
        // const proposalsCount = await api.query.treasury.proposalCount();
        const proposals = await api.query.treasury.proposals(proposalIndex);
        console.log(`\nTreasury Proposal ${proposalIndex}: `, proposals.toString());

    } catch (error) {
        console.log("error while getTreasuryProposals: ", error);
    }
}

