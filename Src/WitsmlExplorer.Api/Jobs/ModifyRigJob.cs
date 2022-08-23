using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs
{
    public record ModifyRigJob : Job
    {
        public Rig Rig { get; init; }

        public override string Description()
        {
            return $"ToModify - WellUid: {Rig.WellUid}; WellboreUid: {Rig.WellboreUid}; RigUid: {Rig.Uid};";
        }
    }
}