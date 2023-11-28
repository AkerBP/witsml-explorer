using System.Globalization;

using Witsml.Data;
using Witsml.Data.Measures;
using Witsml.Data.Tubular;
using Witsml.Extensions;

using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Query
{
    public static class TubularQueries
    {
        public static WitsmlTubulars GetWitsmlTubular(string wellUid, string wellboreUid, string tubularUid = "")
        {
            return new WitsmlTubulars
            {
                Tubulars = new WitsmlTubular
                {
                    Uid = tubularUid,
                    UidWell = wellUid,
                    UidWellbore = wellboreUid,
                    Name = "",
                    NameWell = "",
                    NameWellbore = "",
                    TypeTubularAssy = "",
                    CommonData = new WitsmlCommonData()
                    {
                        DTimCreation = "",
                        DTimLastChange = ""
                    }
                }.AsSingletonList()
            };
        }

        public static WitsmlTubulars UpdateTubularComponent(TubularComponent tubularComponent, ObjectReference tubularReference)
        {
            WitsmlTubularComponent tc = new()
            {
                Uid = tubularComponent.Uid,
                Sequence = tubularComponent.Sequence,
                TypeTubularComp = tubularComponent.TypeTubularComponent
            };

            if (tubularComponent.Id != null)
            {
                tc.Id = new WitsmlLengthMeasure { Uom = tubularComponent.Id.Uom, Value = tubularComponent.Id.Value.ToString(CultureInfo.InvariantCulture) };
            }

            if (tubularComponent.Od != null)
            {
                tc.Od = new WitsmlLengthMeasure { Uom = tubularComponent.Od.Uom, Value = tubularComponent.Od.Value.ToString(CultureInfo.InvariantCulture) };
            }

            if (tubularComponent.Len != null)
            {
                tc.Len = new WitsmlLengthMeasure { Uom = tubularComponent.Len.Uom, Value = tubularComponent.Len.Value.ToString(CultureInfo.InvariantCulture) };
            }

            return new WitsmlTubulars
            {
                Tubulars = new WitsmlTubular
                {
                    UidWell = tubularReference.WellUid,
                    UidWellbore = tubularReference.WellboreUid,
                    Uid = tubularReference.Uid,
                    TubularComponents = tc.AsSingletonList()
                }.AsSingletonList()
            };
        }
    }
}
